/** =========================
 * METRICS + SCORING MODULE
 * ========================= */
function getScoreEnabledFieldDefs_() {
  return getRuntimeSchema_().allDefs.filter(def =>
    def.active &&
    def.scoreEnabled &&
    typeof def.mainCol === 'number' &&
    !isNaN(def.mainCol)
  );
}

function getScoreProfileForField_(def) {
  return CORE_SCORE_PROFILES[String(def?.fieldId || '').trim()] || {};
}

function getResolvedScoreRule_(def) {
  const explicitRule = String(def?.scoreRule || '').trim();
  if (explicitRule) return explicitRule;

  const profile = getScoreProfileForField_(def);
  if (profile.scoreRule) return profile.scoreRule;

  if (def?.type === 'checkbox') return 'checkbox_true';
  if ((def?.type === 'number' || def?.type === 'currency') && def.scoreMin !== '' && def.scoreMin != null) return 'number_gte';
  return 'presence';
}

function getResolvedScoreDependencyFieldId_(def) {
  const explicit = String(def?.dependencyFieldId || '').trim();
  if (explicit) return explicit;
  return String(getScoreProfileForField_(def).dependencyFieldId || '').trim();
}

function getScoreWeightValue_(def, cfg) {
  if (def?.weight !== '' && def?.weight != null) {
    const explicit = Number(def.weight);
    if (!isNaN(explicit)) return explicit;
  }

  const profile = getScoreProfileForField_(def);
  if (profile.weightCfgKey) {
    const cfgVal = Number(cfg?.[profile.weightCfgKey]);
    if (!isNaN(cfgVal)) return cfgVal;
  }
  return Number(profile.weightFallback || 0) || 0;
}

function getScoreWeightExprA1_(def) {
  if (def?.weight !== '' && def?.weight != null) {
    const explicit = Number(def.weight);
    if (!isNaN(explicit)) return String(explicit);
  }

  const profile = getScoreProfileForField_(def);
  if (profile.weightCfgKey) return cfgA1_(profile.weightCfgKey, Number(profile.weightFallback || 0) || 0);
  return String(Number(profile.weightFallback || 0) || 0);
}

function getScoreMinValue_(def, cfg) {
  if (def?.scoreMin !== '' && def?.scoreMin != null) {
    const explicit = Number(def.scoreMin);
    if (!isNaN(explicit)) return explicit;
  }

  const profile = getScoreProfileForField_(def);
  if (profile.scoreMinCfgKey) {
    const cfgVal = Number(cfg?.[profile.scoreMinCfgKey]);
    if (!isNaN(cfgVal)) return cfgVal;
  }
  return Number(profile.scoreMinFallback || 0) || 0;
}

function getScoreMinExprA1_(def) {
  if (def?.scoreMin !== '' && def?.scoreMin != null) {
    const explicit = Number(def.scoreMin);
    if (!isNaN(explicit)) return String(explicit);
  }

  const profile = getScoreProfileForField_(def);
  if (profile.scoreMinCfgKey) return cfgA1_(profile.scoreMinCfgKey, Number(profile.scoreMinFallback || 0) || 0);
  return String(Number(profile.scoreMinFallback || 0) || 0);
}

function isScoreDependencySatisfied_(depDef, depVal) {
  if (!depDef) return true;
  if (depDef.type === 'checkbox') return depVal === true;
  return !isBlank_(depVal);
}

function buildScoreDependencyExprA1_(depDef, r) {
  if (!depDef || !(typeof depDef.mainCol === 'number' && !isNaN(depDef.mainCol))) return 'TRUE';
  const depL = colToLetter_(depDef.mainCol);
  if (depDef.type === 'checkbox') return `$${depL}${r}=TRUE`;
  return `NOT(ISBLANK($${depL}${r}))`;
}

function buildFieldScoreExpressionA1_(def, r, schema) {
  const L = colToLetter_(def.mainCol);
  const weightExpr = getScoreWeightExprA1_(def);
  if (Number(weightExpr) === 0 && !String(weightExpr).includes('CFG_')) return '0';

  const rule = getResolvedScoreRule_(def);
  const depFieldId = getResolvedScoreDependencyFieldId_(def);
  const depDef = depFieldId ? schema.fieldMap[depFieldId] : null;
  const depExpr = buildScoreDependencyExprA1_(depDef, r);

  switch (rule) {
    case 'checkbox_true':
      return `IF($${L}${r}=TRUE,${weightExpr},0)`;
    case 'number_gte':
      return `IF($${L}${r}>=${getScoreMinExprA1_(def)},${weightExpr},0)`;
    case 'presence_with_dependency':
      return `IF(AND(NOT(ISBLANK($${L}${r})),${depExpr}),${weightExpr},0)`;
    case 'checkbox_with_dependency':
      return `IF(AND($${L}${r}=TRUE,${depExpr}),${weightExpr},0)`;
    case 'dropdown_pass': {
      const allowAfter5Key = getScoreProfileForField_(def).allowAfter5CfgKey || 'CFG_ALLOW_AFTER5_PASS';
      return `IF(OR($${L}${r}="None",AND(${cfgA1_(allowAfter5Key, true)},$${L}${r}="After 5PM")),${weightExpr},0)`;
    }
    case 'presence':
    default:
      return `IF(NOT(ISBLANK($${L}${r})),${weightExpr},0)`;
  }
}

function evaluateScoreFieldPoints_(def, row, cfg, schema) {
  const idx = def.mainCol - 1;
  const val = row[idx];
  const weight = getScoreWeightValue_(def, cfg);
  if (!(weight > 0)) return 0;

  const rule = getResolvedScoreRule_(def);
  const depFieldId = getResolvedScoreDependencyFieldId_(def);
  const depDef = depFieldId ? schema.fieldMap[depFieldId] : null;
  const depVal = depDef && depDef.mainCol ? row[depDef.mainCol - 1] : null;

  switch (rule) {
    case 'checkbox_true':
      return val === true ? weight : 0;
    case 'number_gte': {
      const num = (typeof val === 'number') ? val : (isBlank_(val) ? null : Number(val));
      return (num != null && !isNaN(num) && num >= getScoreMinValue_(def, cfg)) ? weight : 0;
    }
    case 'presence_with_dependency':
      return (!isBlank_(val) && isScoreDependencySatisfied_(depDef, depVal)) ? weight : 0;
    case 'checkbox_with_dependency':
      return (val === true && isScoreDependencySatisfied_(depDef, depVal)) ? weight : 0;
    case 'dropdown_pass': {
      const smoke = String(val ?? '').trim();
      const allowAfter5 = !!cfg[(getScoreProfileForField_(def).allowAfter5CfgKey || 'CFG_ALLOW_AFTER5_PASS')];
      return (smoke === 'None' || (allowAfter5 && smoke === 'After 5PM')) ? weight : 0;
    }
    case 'presence':
    default:
      return !isBlank_(val) ? weight : 0;
  }
}

const CORE_DISPLAY_THRESHOLD_PROFILES = {
  sleep: { blueCfgKey: 'CFG_SLEEP_BLUE_MIN', blueFallback: 6.5, greenCfgKey: 'CFG_SLEEP_GREEN_MIN', greenFallback: 7.5 },
  water: { blueCfgKey: 'CFG_WATER_BLUE_MIN', blueFallback: 96, greenCfgKey: 'CFG_WATER_GREEN_MIN', greenFallback: 128 },
  calories: { blueCfgKey: 'CFG_CALS_BLUE_MIN', blueFallback: 2500, greenCfgKey: 'CFG_CALS_GREEN_MIN', greenFallback: 3000 },
  protein: { blueCfgKey: 'CFG_PRO_BLUE_MIN', blueFallback: 150, greenCfgKey: 'CFG_PRO_GREEN_MIN', greenFallback: 180 },
  job_hunt: { blueCfgKey: 'CFG_JOB_BLUE_MIN', blueFallback: 3, greenCfgKey: 'CFG_JOB_GREEN_MIN', greenFallback: 5 },
  apps_sent: { blueCfgKey: 'CFG_APPS_BLUE_MIN', blueFallback: 1, greenCfgKey: 'CFG_APPS_GREEN_MIN', greenFallback: 5 },
  scholastic: { blueCfgKey: 'CFG_SCHOL_BLUE_MIN', blueFallback: 1, greenCfgKey: 'CFG_SCHOL_GREEN_MIN', greenFallback: 2 }
};

function getDisplayThresholdProfileForField_(def) {
  return CORE_DISPLAY_THRESHOLD_PROFILES[String(def?.fieldId || '').trim()] || null;
}

function getDisplayThresholdsForField_(def, cfg) {
  if (!def) return null;

  const explicitBlue = (def.blueMin === '' || def.blueMin == null) ? null : Number(def.blueMin);
  const explicitGreen = (def.greenMin === '' || def.greenMin == null) ? null : Number(def.greenMin);
  if (explicitBlue != null || explicitGreen != null) return { blue: explicitBlue, green: explicitGreen };

  const profile = getDisplayThresholdProfileForField_(def);
  if (profile) {
    const blue = Number(cfg?.[profile.blueCfgKey]);
    const green = Number(cfg?.[profile.greenCfgKey]);
    return {
      blue: !isNaN(blue) ? blue : Number(profile.blueFallback || 0),
      green: !isNaN(green) ? green : Number(profile.greenFallback || 0)
    };
  }

  const scoreRule = getResolvedScoreRule_(def);
  if (scoreRule === 'number_gte') {
    return { blue: getScoreMinValue_(def, cfg), green: null };
  }

  return null;
}

function getDisplayThresholdsExprA1_(def) {
  if (!def) return null;

  const explicitBlue = (def.blueMin === '' || def.blueMin == null) ? null : Number(def.blueMin);
  const explicitGreen = (def.greenMin === '' || def.greenMin == null) ? null : Number(def.greenMin);
  if (explicitBlue != null || explicitGreen != null) {
    return {
      blue: explicitBlue != null ? String(explicitBlue) : null,
      green: explicitGreen != null ? String(explicitGreen) : null
    };
  }

  const profile = getDisplayThresholdProfileForField_(def);
  if (profile) {
    return {
      blue: cfgA1_(profile.blueCfgKey, Number(profile.blueFallback || 0)),
      green: cfgA1_(profile.greenCfgKey, Number(profile.greenFallback || 0))
    };
  }

  const scoreRule = getResolvedScoreRule_(def);
  if (scoreRule === 'number_gte') {
    return { blue: getScoreMinExprA1_(def), green: null };
  }

  return null;
}

function scoreDoneExprA1_(r) {
  const schema = getRuntimeSchema_();
  const parts = getScoreEnabledFieldDefs_()
    .map(def => buildFieldScoreExpressionA1_(def, r, schema))
    .filter(Boolean);

  return `(${parts.length ? parts.join('+') : '0'})`;
}

function scoreTotalWeightExprA1_() {
  const parts = getScoreEnabledFieldDefs_()
    .map(def => getScoreWeightExprA1_(def))
    .filter(expr => expr && expr !== '0');

  return `(${parts.length ? parts.join('+') : '0'})`.replace(/\s+/g, ' ').trim();
}

function scorePctHelperFormula_(r) {
  const pts = scoreDoneExprA1_(r);
  const tot = scoreTotalWeightExprA1_();
  return `=IF($A${r}="","",IF(${tot}=0,0,(${pts})/(${tot})))`;
}

function dailyScoreFormula_(r) {
  const helperL = colToLetter_(getScorePctHelperCol_());
  return `=IF(ISBLANK($A${r}),"",SPARKLINE($${helperL}${r},{"charttype","bar";"max",1;"color1","${THEME.sparklineGreen}"}))`;
}

function dailySummaryFormula_(r) {
  const pts = scoreDoneExprA1_(r);
  const tot = scoreTotalWeightExprA1_();

  return `=IF($C${r}="","",
    LET(
      pts, ${pts},
      tot, ${tot},
      pct, IF(tot=0,0,pts/tot),
      xp, ROUND(pct*100),
      bars, ROUND(pct*10),
      barStr, REPT("🟩", bars) & REPT("⬜", MAX(0,10-bars)),
      sSleep, IF($E${r}="", "--", $E${r}&"h"),
      sWater, IF($F${r}="", "--", $F${r}&"oz"),
      sCals, IF($H${r}="", "--", $H${r}),
      sPro, IF($I${r}="", "--", $I${r}&"g"),
      sJob, IF($Q${r}="", "--", $Q${r}&"h"),
      sApps, IF($R${r}="", "--", $R${r}),
      sSch, IF($T${r}="", "--", $T${r}&"h"),
      sPL, IF($V${r}="", "--", "$"&$V${r}),
      stepsText, "👟 "&IF($G${r}=TRUE, "PASS", "MISS"),
      workoutText, IF($L${r}="", "🏋️ --", IF($L${r}="Rest/Light Outdoor", "🏋️ REST", "🏋️ DONE")),
      smokeText, IF($P${r}="", "🚭 --", IF($P${r}="None", "🚭 PASS", IF($P${r}="After 5PM", "🚭 LATE", "🚭 FAIL"))),
      tradeText, IF($U${r}=TRUE, IF($W${r}="", "🎯 ADD", "🎯 READY"), ""),
      projectText, IF($Y${r}=TRUE, IF($Z${r}="", "🛠️ ADD", "🛠️ READY"), ""),
      leftCount,
        N($E${r}="") + N($F${r}="") + N($H${r}="") + N($I${r}="") +
        N($G${r}<>TRUE) + N($J${r}<>TRUE) + N($K${r}<>TRUE) + N($M${r}<>TRUE) +
        N($N${r}<>TRUE) + N($O${r}<>TRUE) + N($L${r}="") + N($P${r}="") +
        N(AND($U${r}=TRUE, $W${r}="")) + N(AND($Y${r}=TRUE, $Z${r}="")),
      warningText, IF(leftCount>0, "⚠️ "&leftCount&" LEFT", ""),
      badgeLine, TEXTJOIN("  ", TRUE, stepsText, workoutText, smokeText, tradeText, projectText, warningText),
      "✅ XP "&xp&"/100 ("&TEXT(pct,"0%")&") • PTS "&ROUND(pts,0)&"/"&ROUND(tot,0)&"  "&barStr
      &CHAR(10)&
      "😴 "&sSleep&"  💧 "&sWater&"  🍽️ "&sCals&"  🥩 "&sPro&"  💼 "&sJob&"  📬 "&sApps&"  📚 "&sSch&"  📈 "&sPL
      &IF(badgeLine="", "", CHAR(10)&badgeLine)
    )
  )`.replace(/\s+/g, ' ').trim();
}

function injectDailyScoreSparklines_(sheet, numRows, startRowOverride) {
  const start = startRowOverride || START_ROW;
  sheet.getRange(start, COL_DAILY_SCORE, numRows, 1).setFormulas(
    Array.from({ length: numRows }, (_, i) => [dailyScoreFormula_(start + i)])
  );
}

function injectDailySummaries_(sheet, numRows, startRowOverride) {
  const start = startRowOverride || START_ROW;
  sheet.getRange(start, COL_DAILY_SUMMARY, numRows, 1)
    .setFormulas(Array.from({ length: numRows }, (_, i) => [dailySummaryFormula_(start + i)]))
    .setWrap(true)
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
}

/** =========================
 * CONDITIONAL FORMATTING
 * ========================= */
function applySmartFormatting(sheet) {
  const rules = [];
  const endRow = getLastDataRow_(sheet);
  if (endRow < START_ROW) return;

  const helperL = colToLetter_(getScorePctHelperCol_());
  const schema = getRuntimeSchema_();
  const fieldMap = schema.fieldMap;
  const SCORE_BLUE = cfgA1_('CFG_SCORE_BLUE_MIN', 0.60);
  const SCORE_GREEN = cfgA1_('CFG_SCORE_GREEN_MIN', 0.85);

  function getDefA1_(fieldId) {
    const def = fieldMap[fieldId];
    if (!def || !(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return null;
    const L = colToLetter_(def.mainCol);
    return { def, L, rangeA1: `${L}${START_ROW}:${L}${endRow}` };
  }

  function addNumberFieldFormatting_(fieldId) {
    const ref = getDefA1_(fieldId);
    if (!ref) return;

    const thresholds = getDisplayThresholdsExprA1_(ref.def);
    if (!thresholds) {
      rules.push(cfRule_(`=AND($C${START_ROW}=TODAY(), ISBLANK($${ref.L}${START_ROW}))`, THEME.failFill, ref.rangeA1, sheet));
      return;
    }

    if (thresholds.blue != null) {
      rules.push(cfRule_(`=AND(NOT(ISBLANK($${ref.L}${START_ROW})), $${ref.L}${START_ROW}<${thresholds.blue})`, THEME.failFill, ref.rangeA1, sheet));
    }

    if (thresholds.green != null && thresholds.blue != null) {
      rules.push(cfRule_(`=AND(NOT(ISBLANK($${ref.L}${START_ROW})), $${ref.L}${START_ROW}>=${thresholds.blue}, $${ref.L}${START_ROW}<${thresholds.green})`, '#dbeafe', ref.rangeA1, sheet));
      rules.push(cfRule_(`=AND(NOT(ISBLANK($${ref.L}${START_ROW})), $${ref.L}${START_ROW}>=${thresholds.green})`, '#dcfce7', ref.rangeA1, sheet));
    } else if (thresholds.blue != null) {
      rules.push(cfRule_(`=AND(NOT(ISBLANK($${ref.L}${START_ROW})), $${ref.L}${START_ROW}>=${thresholds.blue})`, '#dcfce7', ref.rangeA1, sheet));
    }
  }

  rules.push(cfRule_(`=$C${START_ROW}=TODAY()`, THEME.todayHighlight, `A${START_ROW}:C${endRow}`, sheet));

  ['L', 'W', 'Z', 'AA', 'AC'].forEach(col => {
    rules.push(cfRule_(`=NOT(ISBLANK($${col}${START_ROW}))`, '#dbeafe', `${col}${START_ROW}:${col}${endRow}`, sheet));
  });

  ['D', 'E', 'F', 'H', 'I', 'Q', 'R', 'T'].forEach(col => {
    rules.push(cfRule_(`=AND($C${START_ROW}=TODAY(), ISBLANK($${col}${START_ROW}))`, THEME.failFill, `${col}${START_ROW}:${col}${endRow}`, sheet));
  });

  const CHECKBOX_COLS = [COL_STEPS, COL_VIT, COL_POSTURE, COL_BRUSH, COL_FLOSS, COL_MOUTH, COL_TRADING, COL_CAREERDEV, COL_PROJECTS, COL_READ];
  CHECKBOX_COLS.forEach(col => {
    const L = colToLetter_(col);
    rules.push(cfRule_(`=AND($C${START_ROW}=TODAY(), ${L}${START_ROW}=FALSE)`, THEME.failFill, `${L}${START_ROW}:${L}${endRow}`, sheet));
    rules.push(cfRule_(`=${L}${START_ROW}=TRUE`, '#dcfce7', `${L}${START_ROW}:${L}${endRow}`, sheet));
  });

  rules.push(cfRule_(`=$L${START_ROW}="Rest/Light Outdoor"`, '#dbeafe', `L${START_ROW}:L${endRow}`, sheet));
  rules.push(cfRule_(`=AND(NOT(ISBLANK($L${START_ROW})), $L${START_ROW}<>"Rest/Light Outdoor")`, '#dcfce7', `L${START_ROW}:L${endRow}`, sheet));

  ['sleep', 'water', 'calories', 'protein', 'job_hunt', 'apps_sent', 'scholastic'].forEach(addNumberFieldFormatting_);

  rules.push(cfRule_(`=$P${START_ROW}="None"`, '#dcfce7', `P${START_ROW}:P${endRow}`, sheet));
  rules.push(cfRule_(`=$P${START_ROW}="After 5PM"`, '#dbeafe', `P${START_ROW}:P${endRow}`, sheet));
  rules.push(cfRule_(`=$P${START_ROW}="Failed (Before 5PM)"`, THEME.failFill, `P${START_ROW}:P${endRow}`, sheet));

  rules.push(cfRule_(`=AND(NOT(ISBLANK($S${START_ROW})), $S${START_ROW}>=1)`, '#dcfce7', `S${START_ROW}:S${endRow}`, sheet));

  rules.push(cfRule_(`=AND(NOT(ISBLANK($V${START_ROW})), $V${START_ROW}<0)`, THEME.failFill, `V${START_ROW}:V${endRow}`, sheet));
  rules.push(cfRule_(`=AND(NOT(ISBLANK($V${START_ROW})), $V${START_ROW}=0)`, '#dbeafe', `V${START_ROW}:V${endRow}`, sheet));
  rules.push(cfRule_(`=AND(NOT(ISBLANK($V${START_ROW})), $V${START_ROW}>0)`, '#dcfce7', `V${START_ROW}:V${endRow}`, sheet));

  rules.push(cfRule_(`=AND($C${START_ROW}=TODAY(), $U${START_ROW}=TRUE, ISBLANK($W${START_ROW}))`, THEME.failFill, `W${START_ROW}:W${endRow}`, sheet));
  rules.push(cfRule_(`=AND($C${START_ROW}=TODAY(), $Y${START_ROW}=TRUE, ISBLANK($Z${START_ROW}))`, THEME.failFill, `Z${START_ROW}:Z${endRow}`, sheet));

  rules.push(cfRule_(`=AND(NOT(ISBLANK($C${START_ROW})), $${helperL}${START_ROW}<${SCORE_BLUE})`, THEME.failFill, `AE${START_ROW}:AF${endRow}`, sheet));
  rules.push(cfRule_(`=AND(NOT(ISBLANK($C${START_ROW})), $${helperL}${START_ROW}>=${SCORE_BLUE}, $${helperL}${START_ROW}<${SCORE_GREEN})`, '#dbeafe', `AE${START_ROW}:AF${endRow}`, sheet));
  rules.push(cfRule_(`=AND(NOT(ISBLANK($C${START_ROW})), $${helperL}${START_ROW}>=${SCORE_GREEN})`, '#dcfce7', `AE${START_ROW}:AF${endRow}`, sheet));

  // Generic custom-field formatting
  schema.customDefs.forEach(def => {
    if (!def.active || !def.visibleOnMain) return;
    if (!(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return;

    const L = colToLetter_(def.mainCol);
    const rangeA1 = `${L}${START_ROW}:${L}${endRow}`;
    const depFieldId = String(def.dependencyFieldId || '').trim();
    const depDef = depFieldId ? schema.fieldMap[depFieldId] : null;
    const depExpr = depDef ? buildScoreDependencyExprA1_(depDef, START_ROW) : null;

    if (def.type === 'checkbox') {
      rules.push(cfRule_(`=AND($C${START_ROW}=TODAY(), ${depExpr ? `${depExpr}, ` : ''}${L}${START_ROW}=FALSE)`, THEME.failFill, rangeA1, sheet));
      rules.push(cfRule_(`=${L}${START_ROW}=TRUE`, '#dcfce7', rangeA1, sheet));
    } else if (def.type === 'number' || def.type === 'currency') {
      const thresholds = getDisplayThresholdsExprA1_(def);
      if (thresholds && thresholds.blue != null) {
        rules.push(cfRule_(`=AND(NOT(ISBLANK($${L}${START_ROW})), $${L}${START_ROW}<${thresholds.blue})`, THEME.failFill, rangeA1, sheet));
        if (thresholds.green != null) {
          rules.push(cfRule_(`=AND(NOT(ISBLANK($${L}${START_ROW})), $${L}${START_ROW}>=${thresholds.blue}, $${L}${START_ROW}<${thresholds.green})`, '#dbeafe', rangeA1, sheet));
          rules.push(cfRule_(`=AND(NOT(ISBLANK($${L}${START_ROW})), $${L}${START_ROW}>=${thresholds.green})`, '#dcfce7', rangeA1, sheet));
        } else {
          rules.push(cfRule_(`=AND(NOT(ISBLANK($${L}${START_ROW})), $${L}${START_ROW}>=${thresholds.blue})`, '#dcfce7', rangeA1, sheet));
        }
      } else {
        rules.push(cfRule_(`=AND($C${START_ROW}=TODAY(), ${depExpr ? `${depExpr}, ` : ''}ISBLANK($${L}${START_ROW}))`, THEME.failFill, rangeA1, sheet));
      }
    } else {
      rules.push(cfRule_(`=AND($C${START_ROW}=TODAY(), ${depExpr ? `${depExpr}, ` : ''}ISBLANK($${L}${START_ROW}))`, THEME.failFill, rangeA1, sheet));
      rules.push(cfRule_(`=NOT(ISBLANK($${L}${START_ROW}))`, '#dbeafe', rangeA1, sheet));
    }
  });

  sheet.setConditionalFormatRules(rules);
}

function cfRule_(formula, bg, a1Range, sheet) {
  return SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(formula)
    .setBackground(bg)
    .setRanges([sheet.getRange(a1Range)])
    .build();
}

/** =========================
 * WEIGHTED METRIC HELPERS
 * ========================= */
function totalWeightFromCfg_(cfg) {
  return getScoreEnabledFieldDefs_()
    .reduce((sum, def) => sum + getScoreWeightValue_(def, cfg), 0);
}

function weightedPointsFromRowValues_(row, cfg) {
  const schema = getRuntimeSchema_();
  return getScoreEnabledFieldDefs_()
    .reduce((sum, def) => sum + evaluateScoreFieldPoints_(def, row, cfg, schema), 0);
}

/** =========================
 * CONTINUES IN PART 2
 * ========================= */
 function pillarDayPct_(row, cfg) {
  const num = (v) => (typeof v === 'number' && !isNaN(v)) ? v : null;

  let hyp = 0;
  if (num(row[COL_CAL - 1]) != null && num(row[COL_CAL - 1]) >= Number(cfg.CFG_CALS_SCORE_MIN ?? 2500)) hyp++;
  if (num(row[COL_PRO - 1]) != null && num(row[COL_PRO - 1]) >= Number(cfg.CFG_PRO_SCORE_MIN ?? 150)) hyp++;
  if (!isBlank_(row[COL_WORKOUT - 1])) hyp++;
  const hypPct = hyp / 3;

  let car = 0;
  if (num(row[COL_JOB - 1]) != null && num(row[COL_JOB - 1]) >= Number(cfg.CFG_JOB_SCORE_MIN ?? 5)) car++;
  if (num(row[COL_APPS - 1]) != null && num(row[COL_APPS - 1]) >= Number(cfg.CFG_APPS_BLUE_MIN ?? 1)) car++;
  if (row[COL_CAREERDEV - 1] === true) car++;
  const carPct = car / 3;

  let wea = 0;
  const traded = (row[COL_TRADING - 1] === true && !isBlank_(row[COL_TICKER - 1]));
  const pl = row[COL_PL - 1];
  if (traded) wea++;
  if (typeof pl === 'number') wea++;
  if (typeof pl === 'number' && pl > 0) wea++;
  const weaPct = wea / 3;

  let intel = 0;
  if (num(row[COL_SCHOL - 1]) != null && num(row[COL_SCHOL - 1]) >= Number(cfg.CFG_SCHOL_BLUE_MIN ?? 1)) intel++;
  if (row[COL_PROJECTS - 1] === true && !isBlank_(row[COL_PROJECT_FOCUS - 1])) intel++;
  if (row[COL_READ - 1] === true) intel++;
  const intPct = intel / 3;

  let hab = 0;
  if (num(row[COL_SLEEP - 1]) != null && num(row[COL_SLEEP - 1]) >= Number(cfg.CFG_SLEEP_BLUE_MIN ?? 6.5)) hab++;
  if (num(row[COL_WATER - 1]) != null && num(row[COL_WATER - 1]) >= Number(cfg.CFG_WATER_SCORE_MIN ?? 128)) hab++;
  const smoke = String(row[COL_SMOKING - 1] ?? '').trim();
  if (smoke === 'None' || (!!cfg.CFG_ALLOW_AFTER5_PASS && smoke === 'After 5PM')) hab++;
  if (row[COL_BRUSH - 1] === true && row[COL_FLOSS - 1] === true && row[COL_MOUTH - 1] === true) hab++;
  if (row[COL_POSTURE - 1] === true && row[COL_VIT - 1] === true) hab++;
  const habPct = hab / 5;

  return { hypPct, carPct, weaPct, intPct, habPct };
}

function doneCountFromRowValues_(rowAtoAF, cfg) {
  return weightedPointsFromRowValues_(rowAtoAF, cfg);
}

function getDashGroupBundles_(cfg, schema) {
  const scoredDefs = getScoreEnabledFieldDefs_();
  return getGroupRegistry_()
    .filter(group => group.active && group.showInDash)
    .sort((a, b) => Number(a.sortOrder || 9999) - Number(b.sortOrder || 9999))
    .map(group => {
      const fields = scoredDefs.filter(def => String(def.groupId || '').trim() === String(group.groupId || '').trim());
      const totalWeight = fields.reduce((sum, def) => sum + getScoreWeightValue_(def, cfg), 0);
      return {
        groupId: group.groupId,
        label: group.displayName || group.groupId,
        fields,
        totalWeight
      };
    })
    .filter(group => group.fields.length && group.totalWeight > 0);
}

function getDashGroupScoreForRow_(groupBundle, row, cfg, schema) {
  if (!groupBundle || !groupBundle.totalWeight) return { done: 0, pct: 0 };
  const done = groupBundle.fields.reduce((sum, def) => sum + evaluateScoreFieldPoints_(def, row, cfg, schema), 0);
  return {
    done,
    pct: groupBundle.totalWeight ? (done / groupBundle.totalWeight) : 0
  };
}

/** =========================
 * METRICS + OVERVIEW
 * ========================= */
function refreshOverview() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return;

  const cfg = getConfigValues_();
  const settings = getOsSettings_();
  const metrics = getLiveMetrics();
  const checklist = getTodayChecklist();
  const widgetMaxCol = getDashboardWidgets_().reduce((m, widget) => Math.max(m, Number(widget.anchorCol || 0)), 0);
  const trendMaxCol = getTrendWidgets_().reduce((m, widget) => Math.max(m, Number(widget.anchorCol || 0)), 0);
  const lastVisibleCol = Math.max(BASE_VISIBLE_COL_COUNT, getLastVisibleCol_(), widgetMaxCol, trendMaxCol);
  const widgets = getDashboardWidgets_().filter(widget => widget.enabled && widget.validAnchor && widget.anchorCol <= lastVisibleCol);
  const context = buildOverviewWidgetContext_(sheet, metrics, checklist, cfg);

  sheet.getRange(OVERVIEW_ROW, 1, 1, lastVisibleCol).clearContent();
  sheet.getRange(KPI_ROW, 1, 1, lastVisibleCol).clearContent();

  widgets.forEach(widget => {
    const cell = sheet.getRange(widget.anchorA1);
    const rawValue = resolveOverviewWidgetMetricValue_(widget, context);
    const text = buildOverviewWidgetDisplayText_(widget, context, settings, rawValue);
    cell.setValue(text);
    applyOverviewWidgetCellStyle_(cell, widget, rawValue);
    if (widget.widgetId === 'operator_tip' || String(widget.metricKey || '').trim() === 'operator_tip') {
      cell.setHorizontalAlignment('left').setFontWeight('normal');
    } else {
      cell.setHorizontalAlignment('center').setFontWeight('bold');
    }
  });

  sheet.getRange(OVERVIEW_ROW, 1, 1, lastVisibleCol).setWrap(true).setVerticalAlignment('middle');
  sheet.getRange(KPI_ROW, 1, 1, lastVisibleCol).setWrap(true).setVerticalAlignment('middle');

  applyHideFutureRows_();
}

function buildOverviewWidgetContext_(sheet, metrics, checklist, cfg) {
  const schema = getRuntimeSchema_();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const endRow = getLastDataRow_(sheet);
  const rows = [];
  if (endRow >= START_ROW) {
    const vals = sheet.getRange(START_ROW, 1, endRow - START_ROW + 1, schema.lastVisibleCol).getValues();
    vals.forEach(row => {
      const rowDate = asDate_(row[COL_DATE - 1]);
      if (!rowDate) return;
      rowDate.setHours(0, 0, 0, 0);
      if (rowDate <= today) rows.push(row);
    });
  }
  return { sheet, schema, metrics, checklist, cfg, rows };
}

function buildOverviewWidgetDisplayText_(widget, context, settings, rawValueOverride) {
  const title = resolveDashboardWidgetTitle_(widget, settings);
  const rawValue = (arguments.length >= 4) ? rawValueOverride : resolveOverviewWidgetMetricValue_(widget, context);
  const valueText = formatOverviewWidgetMetricValue_(widget, rawValue, context);
  if (!title) return valueText;
  return `${title}\n${valueText}`;
}

function applyOverviewWidgetCellStyle_(cell, widget, rawValue) {
  const metricKey = String(widget?.metricKey || '').trim();
  cell.setBackground(THEME.darkPanel).setFontColor('#e5e7eb');

  if (metricKey !== 'today_pl') return;

  const n = Number(rawValue);
  if (!isFinite(n)) return;
  if (n > 0) {
    cell.setBackground('#dcfce7').setFontColor('#14532d');
  } else if (n < 0) {
    cell.setBackground(THEME.fail).setFontColor('#ffffff');
  } else {
    cell.setBackground('#dbeafe').setFontColor('#1e3a8a');
  }
}

function resolveDashboardWidgetTitle_(widget, settings) {
  const settingKey = String(widget?.titleSettingKey || '').trim();
  if (settingKey && settings && !isBlank_(settings[settingKey])) return String(settings[settingKey]);
  return String(widget?.title || '').trim();
}

function resolveOverviewWidgetMetricValue_(widget, context) {
  const metricKey = String(widget?.metricKey || '').trim();
  const metrics = context.metrics || {};
  const checklist = context.checklist || {};
  const cfg = context.cfg || {};

  switch (metricKey) {
    case 'avg_score': return metrics.avgScorePct;
    case 'today_score': return metrics.today?.scorePct;
    case 'streak': return `${metrics.streak ?? '--'} (live ${metrics.streakLive ?? '--'})`;
    case 'level': return `Level ${metrics.level ?? '--'} (${metrics.xp ?? '--'} XP)`;
    case 'today_xp': return metrics.today?.xp;
    case 'today_done_max': return todayDoneMaxOverviewWidgetValue_(metrics.today);
    case 'today_pl': return metrics.today?.pl;
    case 'xp_to_next': return metrics.xpToNext;
    case 'job_hours': return metrics.jobHours;
    case 'apps_sent': return metrics.appsSent;
    case 'avg_sleep': return metrics.avgSleep;
    case 'avg_water': return metrics.avgWater;
    case 'total_pl': return metrics.totalPl;
    case 'days_logged': return metrics.daysLogged;
    case 'avg_cals': return metrics.avgCalories;
    case 'avg_pro': return metrics.avgProtein;
    case 'avg_job': return metrics.avgJob;
    case 'proj_hours': return metrics.projHours;
    case 'project_hours': return metrics.projHours;
    case 'win_pct': return metrics.winPct;
    case 'circuit': return metrics.circuitTripped ? 'TRIPPED' : 'SAFE';
    case 'next': return checklist?.next ? checklist.next.label : 'COMPLETE';
    case 'focus': return cfg?.CFG_HIDE_FUTURE_ROWS ? 'ON' : 'OFF';
    case 'today_missing_count': return Array.isArray(metrics.today?.missing) ? metrics.today.missing.length : null;
    case 'best_pillar': return pillarOverviewWidgetValue_(metrics, 'best');
    case 'weakest_pillar': return pillarOverviewWidgetValue_(metrics, 'weakest');
    case 'workout_ratio': return workoutRatioOverviewWidgetValue_(context);
    case 'smoke_pass_ratio': return smokePassRatioOverviewWidgetValue_(context);
    case 'pl_summary': return plSummaryOverviewWidgetValue_(metrics);
    case 'operator_tip': return 'Use Log Today or the main row, not computed columns.';
    default:
      return resolveGenericOverviewWidgetMetric_(metricKey, context);
  }
}

function resolveGenericOverviewWidgetMetric_(metricKey, context) {
  const m = String(metricKey || '').match(/^([a-z_]+):([a-z0-9_]+)$/i);
  if (!m) return '--';

  const op = String(m[1] || '').toLowerCase();
  const fieldId = sanitizeFieldId_(m[2] || '');
  const def = context.schema?.fieldMap?.[fieldId];
  if (!def || !(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return '--';

  const values = context.rows.map(row => row[def.mainCol - 1]);
  switch (op) {
    case 'sum':
      return sumOverviewWidgetValues_(values);
    case 'avg':
      return avgOverviewWidgetValues_(values);
    case 'sum_avg':
      return sumAvgOverviewWidgetValue_(values);
    case 'avg_delta':
      return avgDeltaOverviewWidgetValue_(values);
    case 'count_nonblank':
      return values.filter(v => !isBlank_(v)).length;
    case 'count_true':
      return values.filter(v => v === true).length;
    case 'ratio_true':
      return ratioOverviewWidgetValue_(values.filter(v => v === true).length, context.rows.length);
    case 'ratio_nonblank':
      return ratioOverviewWidgetValue_(values.filter(v => !isBlank_(v)).length, context.rows.length);
    case 'mode':
      return modeOverviewWidgetValue_(values);
    case 'mode_ratio':
      return modeRatioOverviewWidgetValue_(values, context.rows.length);
    case 'today': {
      const todayRow = context.rows.length ? context.rows[context.rows.length - 1] : null;
      return todayRow ? todayRow[def.mainCol - 1] : '--';
    }
    default:
      return '--';
  }
}

function sumOverviewWidgetValues_(values) {
  let total = 0;
  let count = 0;
  values.forEach(v => {
    const n = (typeof v === 'number') ? v : (isBlank_(v) ? null : Number(v));
    if (n == null || isNaN(n)) return;
    total += n;
    count++;
  });
  return count ? total : null;
}

function avgOverviewWidgetValues_(values) {
  let total = 0;
  let count = 0;
  values.forEach(v => {
    const n = (typeof v === 'number') ? v : (isBlank_(v) ? null : Number(v));
    if (n == null || isNaN(n)) return;
    total += n;
    count++;
  });
  return count ? (total / count) : null;
}

function sumAvgOverviewWidgetValue_(values) {
  let total = 0;
  let count = 0;
  values.forEach(v => {
    const n = (typeof v === 'number') ? v : (isBlank_(v) ? null : Number(v));
    if (n == null || isNaN(n)) return;
    total += n;
    count++;
  });
  if (!count) return null;
  const totalText = Math.abs(total % 1) > 0.001 ? total.toFixed(1) : String(Math.round(total));
  const avg = total / count;
  const avgText = Math.abs(avg % 1) > 0.001 ? avg.toFixed(1) : String(Math.round(avg));
  return `${totalText} • ${avgText}/d`;
}

function todayDoneMaxOverviewWidgetValue_(todayMetrics) {
  if (!todayMetrics) return null;
  const done = Number(todayMetrics.done);
  const max = Number(todayMetrics.max);
  if (!isFinite(done) || !isFinite(max) || max <= 0) return null;
  return `${Math.round(done)}/${Math.round(max)}`;
}

function modeOverviewWidgetValue_(values) {
  const counts = {};
  const order = [];
  values.forEach(v => {
    if (isBlank_(v)) return;
    const text = String(v).trim();
    if (!text) return;
    if (!Object.prototype.hasOwnProperty.call(counts, text)) {
      counts[text] = 0;
      order.push(text);
    }
    counts[text]++;
  });
  if (!order.length) return null;

  let best = order[0];
  order.forEach(value => {
    if (counts[value] > counts[best]) best = value;
  });
  return `${truncateOverviewWidgetText_(best, 18)} (${counts[best]})`;
}

function modeRatioOverviewWidgetValue_(values, totalDays) {
  const counts = {};
  const order = [];
  values.forEach(v => {
    if (isBlank_(v)) return;
    const text = String(v).trim();
    if (!text) return;
    if (!Object.prototype.hasOwnProperty.call(counts, text)) {
      counts[text] = 0;
      order.push(text);
    }
    counts[text]++;
  });
  if (!order.length) return null;

  let best = order[0];
  order.forEach(value => {
    if (counts[value] > counts[best]) best = value;
  });
  return `${truncateOverviewWidgetText_(best, 12)} • ${ratioOverviewWidgetValue_(counts[best], totalDays)}`;
}

function ratioOverviewWidgetValue_(count, total) {
  const done = Math.max(0, Number(count || 0));
  const denom = Math.max(0, Number(total || 0));
  return `${Math.round(done)}/${Math.round(denom)}`;
}

function avgDeltaOverviewWidgetValue_(values) {
  const nums = values
    .map(v => (typeof v === 'number') ? v : (isBlank_(v) ? null : Number(v)))
    .filter(v => v != null && !isNaN(v));
  if (!nums.length) return null;

  const avg = nums.reduce((sum, n) => sum + n, 0) / nums.length;
  const delta = nums[nums.length - 1] - nums[0];
  const avgText = Math.abs(avg % 1) > 0.001 ? avg.toFixed(1) : String(Math.round(avg));
  const deltaText = `${delta >= 0 ? '+' : ''}${Math.abs(delta % 1) > 0.001 ? delta.toFixed(1) : Math.round(delta)}`;
  return `${avgText} • ${deltaText}`;
}

function workoutRatioOverviewWidgetValue_(context) {
  const schema = context?.schema || {};
  const def = schema.fieldMap?.workout;
  if (!def || !(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return null;
  const count = (context.rows || []).filter(row => {
    const value = String(row[def.mainCol - 1] == null ? '' : row[def.mainCol - 1]).trim();
    return value && value !== 'Rest/Light Outdoor';
  }).length;
  return ratioOverviewWidgetValue_(count, (context.rows || []).length);
}

function smokePassRatioOverviewWidgetValue_(context) {
  const schema = context?.schema || {};
  const def = schema.fieldMap?.smoking;
  if (!def || !(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return null;
  const allowAfter5 = !!context?.cfg?.CFG_ALLOW_AFTER5_PASS;
  const count = (context.rows || []).filter(row => {
    const smoke = String(row[def.mainCol - 1] == null ? '' : row[def.mainCol - 1]).trim();
    return smoke === 'None' || (allowAfter5 && smoke === 'After 5PM');
  }).length;
  return ratioOverviewWidgetValue_(count, (context.rows || []).length);
}

function plSummaryOverviewWidgetValue_(metrics) {
  const totalPl = metrics?.totalPl;
  const winPct = metrics?.winPct;
  const totalText = (typeof totalPl === 'number' && isFinite(totalPl))
    ? `$${totalPl.toFixed(0)}`
    : '--';
  const winText = (typeof winPct === 'number' && isFinite(winPct))
    ? `${winPct.toFixed(0)}%W`
    : '--';
  return `${totalText} • ${winText}`;
}

function pillarOverviewWidgetValue_(metrics, mode) {
  const labels = Array.isArray(metrics?.radarLabels) ? metrics.radarLabels : [];
  const values = Array.isArray(metrics?.radar) ? metrics.radar : [];
  if (!labels.length || labels.length !== values.length) return null;

  let chosenIdx = -1;
  values.forEach((rawValue, idx) => {
    const value = Number(rawValue);
    if (!isFinite(value)) return;
    if (chosenIdx < 0) {
      chosenIdx = idx;
      return;
    }
    const chosenValue = Number(values[chosenIdx]);
    if (mode === 'best') {
      if (value > chosenValue) chosenIdx = idx;
    } else if (value < chosenValue) {
      chosenIdx = idx;
    }
  });
  if (chosenIdx < 0) return null;

  const label = truncateOverviewWidgetText_(labels[chosenIdx], 12);
  const pct = Number(values[chosenIdx]);
  if (!isFinite(pct)) return label;
  return `${label} • ${Math.round(pct)}%`;
}

function truncateOverviewWidgetText_(value, maxLen) {
  const text = String(value == null ? '' : value).trim();
  const limit = Math.max(8, Number(maxLen || 18));
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trim()}…`;
}

function formatOverviewWidgetMetricValue_(widget, rawValue, context) {
  if (rawValue === null || rawValue === undefined || rawValue === '') return '--';
  const fmt = String(widget?.displayFormat || 'text').trim().toLowerCase();

  if (typeof rawValue === 'string') return truncateOverviewWidgetText_(rawValue, 22);
  if (fmt === 'percent0' || fmt === 'percent1') {
    const n = Number(rawValue);
    if (!isFinite(n)) return '--';
    const decimals = fmt === 'percent1' ? 1 : 0;
    return `${n.toFixed(decimals)}%`;
  }
  if (fmt === 'currency0' || fmt === 'currency2') {
    const n = Number(rawValue);
    if (!isFinite(n)) return '--';
    const decimals = fmt === 'currency2' ? 2 : 0;
    return `$${n.toFixed(decimals)}`;
  }
  if (fmt === 'number0' || fmt === 'integer') {
    const n = Number(rawValue);
    return isFinite(n) ? String(Math.round(n)) : '--';
  }
  if (fmt === 'number1') {
    const n = Number(rawValue);
    return isFinite(n) ? n.toFixed(1) : '--';
  }
  if (fmt === 'number2') {
    const n = Number(rawValue);
    return isFinite(n) ? n.toFixed(2) : '--';
  }
  return String(rawValue);
}

function getLiveMetrics() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const cfg = getConfigValues_();
  const cacheSeconds = Math.max(0, Number(cfg.CFG_CACHE_SECONDS ?? 30));
  const cacheKey = `metrics_${ss.getId()}`;

  if (cacheSeconds > 0) {
    const hit = CacheService.getScriptCache().get(cacheKey);
    if (hit) return JSON.parse(hit);
  }

  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return null;

  const endRow = getLastDataRow_(sheet);
  if (endRow < START_ROW) return null;

  const schema = getRuntimeSchema_();
  const lastVisibleCol = schema.lastVisibleCol;
  const numRows = endRow - START_ROW + 1;
  const rows = sheet.getRange(START_ROW, 1, numRows, lastVisibleCol).getValues();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  let jobSum = 0, appsSum = 0, projCount = 0;
  let scorePctSum = 0, scorePctCount = 0;
  let sleepSum = 0, sleepCount = 0;
  let waterSum = 0, waterCount = 0;
  let calSum = 0, calCount = 0;
  let proSum = 0, proCount = 0;
  let jobAvgSum = 0, jobAvgCount = 0;
  let totalXP = 0;
  const xpPerLevel = Math.max(1, Number(cfg.CFG_XP_PER_LEVEL ?? 500));
  const totalW = totalWeightFromCfg_(cfg);
  const dashGroups = getDashGroupBundles_(cfg, schema);

  const recentPLs = [];
  let plSum = 0, plCount = 0, plPositiveCount = 0;
  const groupDoneTotals = {};
  const groupWeightTotals = {};
  dashGroups.forEach(group => {
    groupDoneTotals[group.groupId] = 0;
    groupWeightTotals[group.groupId] = 0;
  });

  const scoredRows = [];
  const pillarDays = [];

  let todayDone = 0, todayScorePct = 0, todayXP = 0, todayPL = null, todayHigh = null;
  let todayMissing = [];
  const todayWeather = getTodayWeatherSummary_();

  const streakMin = Number(cfg.CFG_STREAK_SCORE_MIN ?? 0.8);
  const includeToday = !!cfg.CFG_STREAK_INCLUDE_TODAY;
  const pillarMin = Number(cfg.CFG_PILLAR_STREAK_MIN ?? 0.75);
  let streak = 0;
  let streakLive = 0;

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowDate = asDate_(r[COL_DATE - 1]);
    if (!rowDate) continue;
    rowDate.setHours(0, 0, 0, 0);
    if (rowDate > today) continue;

    const jobHrs = r[COL_JOB - 1];
    const apps = r[COL_APPS - 1];
    const pl = r[COL_PL - 1];
    const sleep = r[COL_SLEEP - 1];
    const water = r[COL_WATER - 1];
    const calories = r[COL_CAL - 1];
    const protein = r[COL_PRO - 1];

    if (typeof jobHrs === 'number') jobSum += jobHrs;
    if (typeof jobHrs === 'number') { jobAvgSum += jobHrs; jobAvgCount++; }
    if (typeof apps === 'number') appsSum += apps;
    if (r[COL_PROJECTS - 1] === true) projCount++;
    if (typeof pl === 'number') {
      recentPLs.push(pl);
      plSum += pl;
      plCount++;
      if (pl > 0) plPositiveCount++;
    }
    if (typeof sleep === 'number') { sleepSum += sleep; sleepCount++; }
    if (typeof water === 'number') { waterSum += water; waterCount++; }
    if (typeof calories === 'number') { calSum += calories; calCount++; }
    if (typeof protein === 'number') { proSum += protein; proCount++; }

    const pts = weightedPointsFromRowValues_(r, cfg);
    const scorePct = totalW ? (pts / totalW) : 0;
    const xp = Math.round(scorePct * 100);
    totalXP += xp;
    scorePctSum += scorePct * 100;
    scorePctCount++;

    scoredRows.push({
      date: new Date(rowDate),
      dateStr: Utilities.formatDate(rowDate, getAppTimeZone_(), 'MM/dd'),
      scorePct: Math.round(scorePct * 100),
      xp: xp,
      sleep: (typeof r[COL_SLEEP - 1] === 'number') ? r[COL_SLEEP - 1] : null,
      water: (typeof r[COL_WATER - 1] === 'number') ? r[COL_WATER - 1] : null,
      pl: (typeof pl === 'number') ? pl : null
    });

    const groupPcts = {};
    dashGroups.forEach(group => {
      const groupScore = getDashGroupScoreForRow_(group, r, cfg, schema);
      groupDoneTotals[group.groupId] += groupScore.done;
      groupWeightTotals[group.groupId] += group.totalWeight;
      groupPcts[group.groupId] = groupScore.pct;
    });
    pillarDays.push({ date: new Date(rowDate), groups: groupPcts });

    if (rowDate.getTime() === today.getTime()) {
      todayDone = pts;
      todayScorePct = Math.round(scorePct * 100);
      todayXP = xp;
      todayPL = (typeof pl === 'number') ? pl : null;
      todayHigh = r[COL_PHOENIX_TEMP - 1];
      todayMissing = computeMissesForRow_(r, cfg);
    }
  }

  let circuitTripped = false;
  if (recentPLs.length >= 3) {
    const last3 = recentPLs.slice(-3);
    if (last3[0] < 0 && last3[1] < 0 && last3[2] < 0) circuitTripped = true;
  }

  const chronological = scoredRows.slice().sort((a, b) => a.date - b.date);
  for (let i = chronological.length - 1; i >= 0; i--) {
    const d = chronological[i];
    if (!includeToday && d.date.getTime() === today.getTime()) continue;
    if ((d.scorePct / 100) >= streakMin) streak++;
    else break;
  }
  for (let i = chronological.length - 1; i >= 0; i--) {
    const d = chronological[i];
    if ((d.scorePct / 100) >= streakMin) streakLive++;
    else break;
  }

  const pillarChrono = pillarDays.slice().sort((a, b) => a.date - b.date);
  function calcPillarStreak_(groupId, includeTodayFlag) {
    let s = 0;
    for (let i = pillarChrono.length - 1; i >= 0; i--) {
      const d = pillarChrono[i];
      if (!includeTodayFlag && d.date.getTime() === today.getTime()) continue;
      if (((d.groups && d.groups[groupId]) ?? 0) >= pillarMin) s++;
      else break;
    }
    return s;
  }

  const pillarStreaks = { _ordered: dashGroups.map(group => group.groupId) };
  dashGroups.forEach(group => {
    pillarStreaks[group.groupId] = {
      locked: calcPillarStreak_(group.groupId, includeToday),
      live: calcPillarStreak_(group.groupId, true),
      label: group.label
    };
  });

  const radar = dashGroups.map(group =>
    groupWeightTotals[group.groupId]
      ? Math.round((groupDoneTotals[group.groupId] / groupWeightTotals[group.groupId]) * 100)
      : 0
  );

  const trendDays = Math.max(7, Math.min(60, Number(cfg.CFG_TREND_DAYS ?? 14)));
  const lastN = chronological.slice(-trendDays);

  const level = Math.floor(totalXP / xpPerLevel) + 1;
  const xpIntoLevel = totalXP % xpPerLevel;
  const xpToNext = xpPerLevel - xpIntoLevel;

  const out = {
    jobHours: Number(jobSum.toFixed(1)),
    appsSent: appsSum,
    projHours: Number((projCount * 0.25).toFixed(2)),
    daysLogged: chronological.length,
    avgScorePct: scorePctCount ? Number((scorePctSum / scorePctCount).toFixed(1)) : null,
    avgSleep: sleepCount ? Number((sleepSum / sleepCount).toFixed(1)) : null,
    avgWater: waterCount ? Number((waterSum / waterCount).toFixed(0)) : null,
    avgCalories: calCount ? Number((calSum / calCount).toFixed(0)) : null,
    avgProtein: proCount ? Number((proSum / proCount).toFixed(0)) : null,
    avgJob: jobAvgCount ? Number((jobAvgSum / jobAvgCount).toFixed(1)) : null,
    totalPl: plCount ? Number(plSum.toFixed(2)) : 0,
    winPct: plCount ? Number(((plPositiveCount / plCount) * 100).toFixed(1)) : null,

    streak,
    streakLive,
    pillarStreaks,

    level,
    xp: totalXP,
    xpPerLevel,
    xpIntoLevel,
    xpToNext,

    radar,
    radarLabels: dashGroups.map(group => group.label),
    circuitTripped,

    trend: {
      dates: lastN.map(x => x.dateStr),
      scorePct: lastN.map(x => x.scorePct),
      xp: lastN.map(x => x.xp),
      sleep: lastN.map(x => x.sleep),
      water: lastN.map(x => x.water),
      pl: lastN.map(x => x.pl)
    },

    today: {
      done: todayDone,
      max: totalW,
      scorePct: todayScorePct,
      xp: todayXP,
      pl: todayPL,
      high: (todayHigh === '' || todayHigh == null) ? null : todayHigh,
      missing: todayMissing,
      weather: todayWeather
    }
  };

  if (cacheSeconds > 0) CacheService.getScriptCache().put(cacheKey, JSON.stringify(out), cacheSeconds);
  return out;
}

function getChecklistFieldDefs_() {
  return getFieldDefsForSurface_('checklist')
    .filter(def => def.fieldId !== 'uuid' && def.fieldId !== 'day' && def.fieldId !== 'date');
}

function getChecklistThresholdsForField_(def, cfg) {
  return getDisplayThresholdsForField_(def, cfg);
}

function isChecklistDependencyActive_(depDef, depVal) {
  if (!depDef) return true;
  if (depDef.type === 'checkbox') return depVal === true;
  return !isBlank_(depVal);
}

function evaluateChecklistField_(def, row, cfg, schema, rowIndex) {
  if (!def || !(typeof def.mainCol === 'number' && !isNaN(def.mainCol))) return null;

  const val = row[def.mainCol - 1];
  const depDef = def.dependencyFieldId ? schema.fieldMap[String(def.dependencyFieldId || '').trim()] : null;
  const depVal = depDef && depDef.mainCol ? row[depDef.mainCol - 1] : null;
  if (depDef && !isChecklistDependencyActive_(depDef, depVal)) return null;

  const a1 = rowIndex ? `${colToLetter_(def.mainCol)}${rowIndex}` : '';
  let status = 'missing';

  if (def.fieldId === 'smoking' || def.dropdownKey === 'smoking') {
    const smoke = String(val ?? '').trim();
    if (!smoke) status = 'missing';
    else if (smoke === 'None') status = 'good';
    else if (smoke === 'After 5PM') status = cfg.CFG_ALLOW_AFTER5_PASS ? 'mid' : 'bad';
    else status = 'bad';
    return { label: def.label, status, a1 };
  }

  if (def.type === 'checkbox') {
    status = val === true ? 'good' : 'missing';
    return { label: def.label, status, a1 };
  }

  if (def.type === 'number' || def.type === 'currency') {
    const thresholds = getChecklistThresholdsForField_(def, cfg);
    const num = (typeof val === 'number') ? val : (isBlank_(val) ? null : Number(val));
    if (num == null || isNaN(num)) {
      status = 'missing';
    } else if (thresholds) {
      const blue = thresholds.blue;
      const green = thresholds.green;
      if (green != null && num >= green) status = 'good';
      else if (blue != null && num >= blue) status = (green != null ? 'mid' : 'good');
      else status = 'bad';
    } else {
      status = 'good';
    }
    return { label: def.label, status, a1 };
  }

  if (isBlank_(val)) {
    status = depDef ? 'bad' : 'missing';
  } else {
    status = 'good';
  }
  return { label: def.label, status, a1 };
}

function buildChecklistEntriesForRow_(row, rowIndex, cfg) {
  const schema = getRuntimeSchema_();
  const items = getChecklistFieldDefs_()
    .map(def => evaluateChecklistField_(def, row, cfg, schema, rowIndex))
    .filter(Boolean);
  return dedupeChecklistByLabel_(items);
}

function computeMissesForRow_(row, cfg) {
  return uniqueArray_(
    buildChecklistEntriesForRow_(row, null, cfg)
      .filter(it => it.status === 'missing' || it.status === 'bad')
      .map(it => it.label)
  );
}

/** =========================
 * CHECKLIST + NAV
 * ========================= */
function getTodayChecklist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return { items: [], next: null };

  const cfg = getConfigValues_();
  const rowIndex = getTodayRowIndex_();
  if (!rowIndex) return { items: [], next: null };

  const schema = getRuntimeSchema_();
  const v = sheet.getRange(rowIndex, 1, 1, schema.lastVisibleCol).getValues()[0];
  const items = buildChecklistEntriesForRow_(v, rowIndex, cfg);
  const next = items.find(x => x.status === 'missing' || x.status === 'bad') || null;
  return { items, next };
}

function dedupeChecklistByLabel_(items) {
  const seen = new Set();
  const out = [];
  items.forEach(it => {
    const key = `${it.label}__${it.a1}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(it);
  });
  return out;
}
