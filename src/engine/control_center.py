import argparse
import html
import json
import os
import re
import subprocess
import sys
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
from datetime import datetime

from dotenv import load_dotenv

from .doctor import (
    PLAID_OAUTH_STATUS_URL,
    QUICKSTART_PYTHON_DIR,
    collect_checks,
    repo_root,
)
from .env_tokens import split_access_tokens
from .list_linked_accounts import collect_linked_accounts


DEFAULT_HOST = '127.0.0.1'
DEFAULT_PORT = 8790
RUNTIME_STATE = {
    'last_sync': None,
    'last_doctor': None,
}


class ControlCenterError(Exception):
    pass


def load_control_env(root=None):
    root = Path(root or repo_root())
    load_dotenv(root / '.env')
    return dict(os.environ)


def build_config_status(env):
    required = ['PLAID_CLIENT_ID', 'PLAID_SECRET', 'PLAID_ENV', 'PLAID_ACCESS_TOKEN', 'GOOGLE_SPREADSHEET_ID']
    missing = [key for key in required if not env.get(key)]
    tokens = split_access_tokens(env.get('PLAID_ACCESS_TOKEN'))
    return {
        'plaid_env': env.get('PLAID_ENV') or 'missing',
        'token_count': len(tokens),
        'required_keys_present': not missing,
        'missing_keys': missing,
    }


def build_sheet_status(env):
    spreadsheet_id = env.get('GOOGLE_SPREADSHEET_ID') or ''
    sheet_name = env.get('GOOGLE_SHEET_NAME') or 'Transactions'
    return {
        'configured': bool(spreadsheet_id),
        'can_open': bool(spreadsheet_id),
        'sheet_name': sheet_name,
        'masked_spreadsheet_id': ('...' + spreadsheet_id[-4:]) if spreadsheet_id else '',
        'target_label': 'Configured Google Sheet' if spreadsheet_id else 'Missing GOOGLE_SPREADSHEET_ID',
    }


def build_sheet_open_url(env):
    spreadsheet_id = env.get('GOOGLE_SPREADSHEET_ID') or ''
    if not spreadsheet_id:
        raise ControlCenterError('GOOGLE_SPREADSHEET_ID is missing.')
    return f'https://docs.google.com/spreadsheets/d/{spreadsheet_id}/edit'


def build_appscript_redeploy_checklist():
    return '\n'.join([
        'Apps Script redeploy checklist:',
        '1. Open the bound Apps Script project from the Google Sheet.',
        '2. Replace Code.gs with src/appscript/Code.gs from this repo.',
        '3. Replace Sidebar.html with src/appscript/Sidebar.html from this repo.',
        '4. Save the Apps Script project.',
        '5. Reload the Google Sheet.',
        '6. Run Bank Automation -> Refresh Dashboard & Visuals.',
    ])


def build_quickstart_repair_command():
    return '\n'.join([
        'cd /Users/michaelpanico/Desktop/quickstart/python',
        '/bin/rm -rf -- ./venv',
        'python3 -m venv venv',
        './venv/bin/python -m pip install --upgrade pip',
        './venv/bin/python -m pip install -r requirements.txt',
        './venv/bin/python server.py',
        '',
        'Then start the frontend in another Terminal:',
        'cd /Users/michaelpanico/Desktop/quickstart/frontend',
        'npm start',
    ])


def build_us_bank_guidance():
    return '\n'.join([
        'U.S. Bank connection status:',
        'Plaid currently reports INSTITUTION_REGISTRATION_REQUIRED for U.S. Bank on this client.',
        'That means Plaid Production/OAuth institution registration is blocking the connection.',
        'Do not keep retrying U.S. Bank until the Plaid Dashboard shows registration is ready.',
        f'Check status: {PLAID_OAUTH_STATUS_URL}',
        '',
        'When registration is ready, run:',
        '.venv/bin/python -m src.engine.connect_bank --institution-note "U.S. Bank"',
    ])


def record_runtime_event(state, event_type, payload):
    state[f'last_{event_type}'] = {
        'timestamp': datetime.now().isoformat(timespec='seconds'),
        **payload,
    }
    return state[f'last_{event_type}']


def mask_sensitive_text(text, env=None):
    env = env or {}
    masked = str(text or '')
    sensitive_values = []
    for key in [
        'PLAID_CLIENT_ID',
        'PLAID_SECRET',
        'GOOGLE_SPREADSHEET_ID',
        'GEMINI_API_KEY',
    ]:
        value = env.get(key)
        if value:
            sensitive_values.append(str(value))
    sensitive_values.extend(split_access_tokens(env.get('PLAID_ACCESS_TOKEN')))

    for value in sorted(set(sensitive_values), key=len, reverse=True):
        if len(value) >= 4:
            masked = masked.replace(value, '[masked]')
    return masked


def check_results_to_dicts(checks):
    return [
        {
            'name': check.name,
            'status': check.status,
            'detail': check.detail,
        }
        for check in checks
    ]


def build_doctor_payload(root, env, skip_network=True):
    checks = collect_checks(Path(root), env, QUICKSTART_PYTHON_DIR, skip_network=skip_network)
    return {
        'ok': not any(check.status == 'FAIL' for check in checks),
        'checks': check_results_to_dicts(checks),
    }


def build_account_guidance(accounts_payload):
    accounts = []
    for item in (accounts_payload or {}).get('items', []):
        accounts.extend(item.get('accounts') or [])

    has_income_source = any(
        account.get('type') in ('depository', 'investment') and account.get('subtype') not in ('credit card', 'loan')
        for account in accounts
    )
    if has_income_source:
        return {
            'income_status': 'potential_income_source_present',
            'detail': 'A non-credit account is linked, so verified income may be available if payroll/deposits are present.',
        }
    return {
        'income_status': 'no_verified_income_source',
        'detail': 'Savings rate remains N/A until a checking/payroll income account is linked or income rows are imported.',
    }


def parse_sync_summary(output, ok):
    text = output or ''
    appended_match = re.search(r'Appending\s+(\d+)\s+total new transactions', text)
    cells_match = re.search(r'(\d+)\s+cells appended', text)
    retrieval_count = len(re.findall(r'Retrieving transactions for institution', text))
    no_new = 'No new transactions found across all institutions' in text

    if not ok:
        status = 'failed'
    elif no_new:
      status = 'up_to_date'
    else:
      status = 'completed'

    new_transactions = int(appended_match.group(1)) if appended_match else (0 if no_new else None)
    cells_appended = int(cells_match.group(1)) if cells_match else 0
    steps = []
    if 'Authenticating with Google Sheets' in text:
        steps.append({'label': 'Google Sheets authentication', 'status': 'done'})
    if 'Reading existing transaction IDs' in text:
        steps.append({'label': 'Ledger dedupe scan', 'status': 'done'})
    if retrieval_count:
        steps.append({'label': 'Plaid transaction retrieval', 'status': 'done', 'detail': f'{retrieval_count} institution(s) checked'})
    if new_transactions is not None:
        steps.append({'label': 'New transaction detection', 'status': 'done', 'detail': f'{new_transactions} new row(s)'})
    if cells_appended:
        steps.append({'label': 'Google Sheet append', 'status': 'done', 'detail': f'{cells_appended} cell(s) appended'})
    if no_new:
        steps.append({'label': 'Sheet status', 'status': 'done', 'detail': 'Already up to date'})
    if not steps:
        steps.append({'label': 'Command completed' if ok else 'Command failed', 'status': 'done' if ok else 'failed'})

    return {
        'status': status,
        'new_transactions': new_transactions,
        'cells_appended': cells_appended,
        'steps': steps,
    }


def build_next_actions(doctor_payload=None, accounts_payload=None, sync_result=None):
    doctor_payload = doctor_payload or {'checks': []}
    accounts_payload = accounts_payload or {'items': []}
    actions = []

    summary = (sync_result or {}).get('summary') or {}
    if number_like(summary.get('new_transactions')) > 0:
        actions.append({
            'priority': 'high',
            'title': 'Refresh the Dashboard',
            'detail': 'A sync appended new rows. In Google Sheets, run Bank Automation -> Refresh Dashboard & Visuals.',
        })

    for check in doctor_payload.get('checks', []):
        name = check.get('name', '')
        if name == 'quickstart venv' and check.get('status') == 'WARN':
            actions.append({
                'priority': 'medium',
                'title': 'Repair Quickstart fallback when needed',
                'detail': 'Quickstart has stale path markers. Use the Quickstart repair command before using fallback bank linking.',
            })
        if name == 'Plaid OAuth blockers':
            actions.append({
                'priority': 'medium',
                'title': 'Wait for Plaid OAuth registration',
                'detail': 'Plaid OAuth institutions such as U.S. Bank stay blocked until Plaid registration is approved.',
            })

    guidance = build_account_guidance(accounts_payload)
    if guidance['income_status'] == 'no_verified_income_source':
        actions.append({
            'priority': 'low',
            'title': 'Savings rate needs income',
            'detail': guidance['detail'],
        })

    if not actions:
        actions.append({
            'priority': 'low',
            'title': 'No immediate action',
            'detail': 'System checks are clean and no new sync follow-up is required.',
        })
    return actions


def number_like(value):
    try:
        return int(value or 0)
    except (TypeError, ValueError):
        return 0


def build_status_payload(root=None, env=None, runtime_state=None):
    root = Path(root or repo_root())
    env = env or load_control_env(root)
    doctor_payload = build_doctor_payload(root, env, skip_network=True)
    accounts_payload = collect_linked_accounts(env)
    runtime_state = runtime_state or RUNTIME_STATE
    return {
        'project_root': str(root),
        'config': build_config_status(env),
        'sheet': build_sheet_status(env),
        'doctor': doctor_payload,
        'accounts': accounts_payload,
        'account_guidance': build_account_guidance(accounts_payload),
        'runtime': runtime_state,
        'next_actions': build_next_actions(
            doctor_payload=doctor_payload,
            accounts_payload=accounts_payload,
            sync_result=runtime_state.get('last_sync'),
        ),
        'appscript': {
            'manual_deploy_required': True,
            'checklist': build_appscript_redeploy_checklist(),
        },
        'blockers': [{
            'name': 'U.S. Bank OAuth registration',
            'status': 'blocked_by_plaid',
            'code': 'INSTITUTION_REGISTRATION_REQUIRED',
            'url': PLAID_OAUTH_STATUS_URL,
            'detail': 'Wait for Plaid Production/OAuth institution registration before retrying U.S. Bank.',
        }],
    }


def run_sync_command(confirm=False, root=None, env=None, runner=subprocess.run):
    if not confirm:
        raise ControlCenterError('Sync requires explicit browser confirmation because it can append rows to Google Sheets.')

    root = Path(root or repo_root())
    env = env or load_control_env(root)
    proc = runner(
        [sys.executable, '-m', 'src.engine.main'],
        cwd=str(root),
        text=True,
        capture_output=True,
        timeout=180,
    )
    output = '\n'.join(part for part in [getattr(proc, 'stdout', ''), getattr(proc, 'stderr', '')] if part)
    masked_output = mask_sensitive_text(output.strip(), env)
    ok = getattr(proc, 'returncode', 1) == 0
    return {
        'ok': ok,
        'returncode': getattr(proc, 'returncode', 1),
        'output': masked_output,
        'summary': parse_sync_summary(masked_output, ok),
    }


def run_doctor_command(root=None, env=None, skip_network=True):
    root = Path(root or repo_root())
    env = env or load_control_env(root)
    return build_doctor_payload(root, env, skip_network=skip_network)


def render_control_center_html():
    title = 'Danny Bank Control Center'
    escaped_checklist = html.escape(build_appscript_redeploy_checklist())
    escaped_guidance = html.escape(build_us_bank_guidance())
    escaped_quickstart = html.escape(build_quickstart_repair_command())
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>
    :root {{
      --bg: #f6f8fb;
      --panel: #ffffff;
      --text: #111827;
      --muted: #64748b;
      --border: #d5dbe5;
      --blue: #2563eb;
      --green: #15803d;
      --amber: #b45309;
      --red: #b91c1c;
      --navy: #0f172a;
      --cyan: #0e7490;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    }}
    header {{
      background: var(--navy);
      color: #fff;
      padding: 18px 28px;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
    }}
    h1 {{ font-size: 20px; margin: 0; }}
    main {{ max-width: 1240px; margin: 0 auto; padding: 22px; }}
    h2 {{ font-size: 14px; margin: 0 0 10px; color: #0f172a; }}
    h3 {{ font-size: 13px; margin: 0 0 8px; color: #334155; }}
    .topline {{ display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }}
    .pill {{
      border-radius: 999px;
      padding: 5px 9px;
      font-size: 11px;
      font-weight: 800;
      border: 1px solid var(--border);
      background: #fff;
      color: #334155;
    }}
    .pill.pass {{ color: var(--green); border-color: #bbf7d0; background: #f0fdf4; }}
    .pill.warn {{ color: var(--amber); border-color: #fde68a; background: #fffbeb; }}
    .pill.fail {{ color: var(--red); border-color: #fecaca; background: #fef2f2; }}
    .layout {{ display: grid; grid-template-columns: 1.5fr 1fr; gap: 16px; align-items: start; }}
    .grid {{ display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 16px; }}
    .card {{
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      min-height: 106px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }}
    .panel {{
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 14px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }}
    .metric {{ font-size: 23px; font-weight: 850; margin: 5px 0; color: #0f172a; }}
    .muted {{ color: var(--muted); font-size: 12px; line-height: 1.45; }}
    .actions {{ display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0; }}
    button {{
      border: 1px solid var(--blue);
      background: var(--blue);
      color: #fff;
      border-radius: 6px;
      padding: 10px 12px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      font-size: 13px;
    }}
    button.secondary {{ background: #fff; color: var(--blue); }}
    button.warning {{ background: var(--amber); border-color: var(--amber); }}
    button:disabled {{ opacity: 0.65; cursor: not-allowed; }}
    pre {{
      background: var(--navy);
      color: #e2e8f0;
      padding: 14px;
      border-radius: 8px;
      overflow: auto;
      white-space: pre-wrap;
      min-height: 160px;
      margin: 0;
    }}
    .list {{ display: grid; gap: 8px; }}
    .row {{
      border: 1px solid #e2e8f0;
      border-radius: 7px;
      padding: 10px;
      background: #fff;
    }}
    .row-title {{ font-weight: 800; font-size: 13px; color: #0f172a; }}
    .row-detail {{ color: var(--muted); font-size: 12px; margin-top: 3px; line-height: 1.45; }}
    .account-card {{
      border-left: 4px solid var(--cyan);
    }}
    .timeline {{ display: grid; gap: 7px; }}
    .step {{
      display: grid;
      grid-template-columns: 18px 1fr;
      gap: 8px;
      align-items: start;
      font-size: 12px;
    }}
    .dot {{
      width: 10px;
      height: 10px;
      border-radius: 999px;
      margin-top: 4px;
      background: var(--green);
    }}
    .dot.failed {{ background: var(--red); }}
    .empty {{ color: var(--muted); font-size: 12px; padding: 10px 0; }}
    @media (max-width: 900px) {{
      .layout {{ grid-template-columns: 1fr; }}
      .grid {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }}
      header {{ align-items: flex-start; flex-direction: column; }}
    }}
    @media (max-width: 560px) {{
      .grid {{ grid-template-columns: 1fr; }}
      main {{ padding: 14px; }}
      .actions button {{ width: 100%; }}
    }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Danny Bank Control Center</h1>
      <div class="muted">Local-only finance operations for sync, health, accounts, and setup guidance.</div>
    </div>
    <div class="topline" id="headerBadges"></div>
  </header>
  <main>
    <section class="grid" id="cards"></section>
    <section class="actions">
      <button onclick="runDoctor()">Run Doctor</button>
      <button onclick="listAccounts()">List Linked Accounts</button>
      <button class="warning" onclick="runSync()">Run Sync Now</button>
      <button class="secondary" onclick="openSheet()">Open Google Sheet</button>
      <button class="secondary" onclick="showText(`{escaped_guidance}`)">U.S. Bank / New Bank Instructions</button>
      <button class="secondary" onclick="showText(`{escaped_quickstart}`)">Quickstart Repair Command</button>
      <button class="secondary" onclick="copyChecklist()">Copy Apps Script Redeploy Checklist</button>
    </section>
    <section class="layout">
      <div>
        <section class="panel">
          <h2>Next Actions</h2>
          <div class="list" id="nextActions"></div>
        </section>
        <section class="panel">
          <h2>Sync Progress</h2>
          <div class="timeline" id="syncTimeline"></div>
        </section>
        <section class="panel">
          <h2>Linked Accounts</h2>
          <div class="list" id="accounts"></div>
        </section>
      </div>
      <aside>
        <section class="panel">
          <h2>Health Warnings</h2>
          <div class="list" id="warnings"></div>
        </section>
        <section class="panel">
          <h2>Last Activity</h2>
          <div class="list" id="activity"></div>
        </section>
        <section class="panel">
          <h2>Command Output</h2>
          <pre id="output">Loading status...</pre>
        </section>
      </aside>
    </section>
  </main>
  <script>
    const checklist = `{escaped_checklist}`;
    let latestStatus = null;

    function setOutput(value) {{
      document.getElementById('output').textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    }}

    function showText(value) {{
      const parser = new DOMParser();
      setOutput(parser.parseFromString(value, 'text/html').documentElement.textContent);
    }}

    async function api(path, options) {{
      const response = await fetch(path, options);
      const payload = await response.json();
      if (!response.ok) {{
        throw new Error(payload.error || 'Request failed');
      }}
      return payload;
    }}

    function badge(text, kind) {{
      return `<span class="pill ${{kind || ''}}">${{text}}</span>`;
    }}

    function renderCards(status) {{
      const cards = [
        ['Plaid', status.config.plaid_env, `${{status.config.token_count}} configured token(s)`],
        ['Google Sheet', status.sheet.configured ? 'Configured' : 'Missing', status.sheet.sheet_name],
        ['Linked Accounts', `${{status.accounts.items.length}} institution(s)`, status.account_guidance.detail],
        ['Doctor', status.doctor.ok ? 'No failures' : 'Needs attention', `${{status.doctor.checks.length}} check(s)`]
      ];
      document.getElementById('cards').innerHTML = cards.map(card => `
        <article class="card">
          <h3>${{card[0]}}</h3>
          <div class="metric">${{card[1]}}</div>
          <div class="muted">${{card[2]}}</div>
        </article>
      `).join('');
    }}

    function renderHeader(status) {{
      const warningCount = status.doctor.checks.filter(check => check.status === 'WARN').length;
      const failCount = status.doctor.checks.filter(check => check.status === 'FAIL').length;
      document.getElementById('headerBadges').innerHTML = [
        badge('Local only', 'pass'),
        badge(status.doctor.ok ? 'No failures' : `${{failCount}} failure(s)`, status.doctor.ok ? 'pass' : 'fail'),
        badge(`${{warningCount}} warning(s)`, warningCount ? 'warn' : 'pass')
      ].join('');
    }}

    function renderWarnings(status) {{
      const warnings = status.doctor.checks.filter(check => check.status !== 'PASS').concat(status.blockers || []);
      document.getElementById('warnings').innerHTML = warnings.length ? warnings.map(item => `
        <div class="row">
          <div class="row-title">${{item.name || item.code}}</div>
          <div class="row-detail">${{item.detail}}</div>
        </div>
      `).join('') : '<div class="empty">No health warnings.</div>';
    }}

    function renderActions(status) {{
      document.getElementById('nextActions').innerHTML = (status.next_actions || []).map(action => `
        <div class="row">
          <div class="row-title">${{badge(action.priority, action.priority === 'high' ? 'fail' : action.priority === 'medium' ? 'warn' : 'pass')}} ${{action.title}}</div>
          <div class="row-detail">${{action.detail}}</div>
        </div>
      `).join('');
    }}

    function renderAccounts(status) {{
      const items = status.accounts.items || [];
      if (!items.length) {{
        document.getElementById('accounts').innerHTML = '<div class="empty">No linked account data loaded.</div>';
        return;
      }}
      document.getElementById('accounts').innerHTML = items.map(item => `
        <div class="row account-card">
          <div class="row-title">${{item.institution_name}}</div>
          <div class="row-detail">${{(item.accounts || []).map(account => `${{account.label}} (${{
            account.type
          }}/${{account.subtype}})`).join('<br>')}}</div>
        </div>
      `).join('');
    }}

    function renderTimeline(sync) {{
      const summary = sync && sync.summary ? sync.summary : null;
      if (!summary) {{
        document.getElementById('syncTimeline').innerHTML = '<div class="empty">No sync has run from this control center session yet.</div>';
        return;
      }}
      document.getElementById('syncTimeline').innerHTML = summary.steps.map(step => `
        <div class="step">
          <span class="dot ${{step.status === 'failed' ? 'failed' : ''}}"></span>
          <div><strong>${{step.label}}</strong><div class="row-detail">${{step.detail || step.status}}</div></div>
        </div>
      `).join('');
    }}

    function renderActivity(status) {{
      const runtime = status.runtime || {{}};
      const rows = [];
      if (runtime.last_sync) {{
        rows.push(`<div class="row"><div class="row-title">Last sync</div><div class="row-detail">${{runtime.last_sync.timestamp}} · ${{runtime.last_sync.summary.status}}</div></div>`);
      }}
      if (runtime.last_doctor) {{
        rows.push(`<div class="row"><div class="row-title">Last doctor</div><div class="row-detail">${{runtime.last_doctor.timestamp}} · ${{runtime.last_doctor.ok ? 'No failures' : 'Needs attention'}}</div></div>`);
      }}
      document.getElementById('activity').innerHTML = rows.length ? rows.join('') : '<div class="empty">No actions yet this session.</div>';
    }}

    function renderAll(status) {{
      latestStatus = status;
      renderHeader(status);
      renderCards(status);
      renderWarnings(status);
      renderActions(status);
      renderAccounts(status);
      renderTimeline(status.runtime.last_sync);
      renderActivity(status);
    }}

    async function loadStatus() {{
      const status = await api('/api/status');
      renderAll(status);
      const lines = ['Project root: ' + status.project_root, '', 'Doctor snapshot:'];
      status.doctor.checks.forEach(check => {{
        lines.push(`[${{check.status}}] ${{check.name}}: ${{check.detail}}`);
      }});
      setOutput(lines.join('\\n'));
    }}

    async function runDoctor() {{
      setOutput('Running doctor...');
      const result = await api('/api/doctor', {{ method: 'POST' }});
      setOutput(result.checks.map(check => `[${{check.status}}] ${{check.name}}: ${{check.detail}}`).join('\\n'));
      await loadStatus();
    }}

    async function listAccounts() {{
      setOutput('Loading linked accounts...');
      const result = await api('/api/linked-accounts');
      const lines = [`Plaid env: ${{result.plaid_env}}`, `Linked Plaid item count: ${{result.item_count}}`];
      (result.items || []).forEach(item => {{
        lines.push('', `${{item.item_index}}. ${{item.institution_name}}`);
        (item.accounts || []).forEach(account => lines.push(`  - ${{account.label}} | ${{account.type}}/${{account.subtype}}`));
      }});
      (result.errors || []).forEach(error => lines.push('', `Item ${{error.item_index}} failed: ${{error.error}}`));
      setOutput(lines.join('\\n'));
      await loadStatus();
    }}

    async function runSync() {{
      if (!confirm('Run a live sync now? This can append new rows to Google Sheets.')) {{
        return;
      }}
      const syncButton = Array.from(document.querySelectorAll('button')).find(button => button.textContent === 'Run Sync Now');
      syncButton.disabled = true;
      setOutput('Running sync...\\n\\nThis may take a few seconds while Plaid and Google Sheets respond.');
      const result = await api('/api/sync', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{ confirm: true }})
      }});
      syncButton.disabled = false;
      const summaryLines = [
        result.ok ? 'Sync completed.' : 'Sync failed.',
        `Status: ${{result.summary.status}}`,
        `New transactions: ${{result.summary.new_transactions ?? 'unknown'}}`,
        `Cells appended: ${{result.summary.cells_appended}}`,
        '',
        result.output || 'No output.'
      ];
      setOutput(summaryLines.join('\\n'));
      await loadStatus();
    }}

    async function openSheet() {{
      const result = await api('/api/open-sheet', {{ method: 'POST' }});
      setOutput(result.message);
    }}

    async function copyChecklist() {{
      const parser = new DOMParser();
      const text = parser.parseFromString(checklist, 'text/html').documentElement.textContent;
      await navigator.clipboard.writeText(text);
      setOutput(text + '\\n\\nCopied to clipboard.');
    }}

    loadStatus().catch(error => setOutput(error.message));
  </script>
</body>
</html>"""


class ControlCenterHandler(BaseHTTPRequestHandler):
    root = repo_root()

    def log_message(self, format, *args):
        return

    def _env(self):
        return load_control_env(self.root)

    def _send_json(self, payload, status=200):
        body = json.dumps(payload, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        length = int(self.headers.get('Content-Length') or 0)
        if not length:
            return {}
        return json.loads(self.rfile.read(length).decode('utf-8') or '{}')

    def do_GET(self):
        path = urlparse(self.path).path
        if path == '/':
            body = render_control_center_html().encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        if path == '/api/status':
            self._send_json(build_status_payload(self.root, self._env()))
            return
        if path == '/api/linked-accounts':
            self._send_json(collect_linked_accounts(self._env()))
            return
        if path == '/api/instructions/us-bank':
            self._send_json({'text': build_us_bank_guidance()})
            return
        if path == '/api/instructions/appscript':
            self._send_json({'text': build_appscript_redeploy_checklist()})
            return
        if path == '/api/instructions/quickstart':
            self._send_json({'text': build_quickstart_repair_command()})
            return
        self._send_json({'error': 'Not found'}, status=404)

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            if path == '/api/doctor':
                payload = run_doctor_command(self.root, self._env(), skip_network=True)
                record_runtime_event(RUNTIME_STATE, 'doctor', payload)
                self._send_json(payload)
                return
            if path == '/api/sync':
                payload = self._read_json()
                result = run_sync_command(
                    confirm=payload.get('confirm') is True,
                    root=self.root,
                    env=self._env(),
                )
                record_runtime_event(RUNTIME_STATE, 'sync', result)
                self._send_json(result)
                return
            if path == '/api/open-sheet':
                webbrowser.open(build_sheet_open_url(self._env()))
                self._send_json({'ok': True, 'message': 'Google Sheet open request sent to the local browser.'})
                return
            self._send_json({'error': 'Not found'}, status=404)
        except ControlCenterError as exc:
            self._send_json({'error': str(exc)}, status=400)
        except Exception as exc:
            self._send_json({'error': str(exc)}, status=500)


def parse_args():
    parser = argparse.ArgumentParser(description='Run the local Danny Bank control center.')
    parser.add_argument('--host', default=DEFAULT_HOST, help='Bind host. Use 127.0.0.1 for local-only access.')
    parser.add_argument('--port', type=int, default=DEFAULT_PORT, help='Bind port.')
    parser.add_argument('--no-open', action='store_true', help='Do not open the browser automatically.')
    return parser.parse_args()


def main():
    args = parse_args()
    if args.host not in ('127.0.0.1', 'localhost'):
        print('Refusing to bind to a non-local host. Use 127.0.0.1.')
        return 2

    ControlCenterHandler.root = repo_root()
    server = ThreadingHTTPServer((args.host, args.port), ControlCenterHandler)
    url = f'http://{args.host}:{args.port}/'
    print(f'Danny Bank Control Center: {url}')
    print('Press Ctrl+C to stop.')
    if not args.no_open:
        webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('')
        print('Control center stopped.')
    finally:
        server.server_close()
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
