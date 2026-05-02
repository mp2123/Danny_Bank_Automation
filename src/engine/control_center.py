import argparse
import html
import json
import os
import subprocess
import sys
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

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


def build_status_payload(root=None, env=None):
    root = Path(root or repo_root())
    env = env or load_control_env(root)
    return {
        'project_root': str(root),
        'config': build_config_status(env),
        'sheet': build_sheet_status(env),
        'doctor': build_doctor_payload(root, env, skip_network=True),
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
    return {
        'ok': getattr(proc, 'returncode', 1) == 0,
        'returncode': getattr(proc, 'returncode', 1),
        'output': mask_sensitive_text(output.strip(), env),
    }


def run_doctor_command(root=None, env=None, skip_network=True):
    root = Path(root or repo_root())
    env = env or load_control_env(root)
    return build_doctor_payload(root, env, skip_network=skip_network)


def render_control_center_html():
    title = 'Danny Bank Control Center'
    escaped_checklist = html.escape(build_appscript_redeploy_checklist())
    escaped_guidance = html.escape(build_us_bank_guidance())
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>
    :root {{
      --bg: #f8fafc;
      --panel: #ffffff;
      --text: #111827;
      --muted: #64748b;
      --border: #cbd5e1;
      --blue: #2563eb;
      --green: #15803d;
      --amber: #b45309;
      --red: #b91c1c;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
    }}
    header {{
      background: #0f172a;
      color: #fff;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
    }}
    h1 {{ font-size: 20px; margin: 0; }}
    main {{ max-width: 1180px; margin: 0 auto; padding: 22px; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }}
    .card {{
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      min-height: 112px;
    }}
    .card h2 {{ font-size: 14px; margin: 0 0 8px; color: #0f172a; }}
    .metric {{ font-size: 24px; font-weight: 800; margin: 4px 0; }}
    .muted {{ color: var(--muted); font-size: 12px; line-height: 1.45; }}
    .actions {{ display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0; }}
    button, a.button {{
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
    pre {{
      background: #0f172a;
      color: #e2e8f0;
      padding: 14px;
      border-radius: 8px;
      overflow: auto;
      white-space: pre-wrap;
      min-height: 180px;
    }}
    .status-PASS {{ color: var(--green); font-weight: 800; }}
    .status-WARN {{ color: var(--amber); font-weight: 800; }}
    .status-FAIL {{ color: var(--red); font-weight: 800; }}
    ul {{ padding-left: 18px; margin: 8px 0 0; }}
  </style>
</head>
<body>
  <header>
    <h1>Danny Bank Control Center</h1>
    <div class="muted">Local-only at 127.0.0.1. Secrets are not displayed.</div>
  </header>
  <main>
    <section class="grid" id="cards"></section>
    <section class="actions">
      <button onclick="runDoctor()">Run Doctor</button>
      <button onclick="listAccounts()">List Linked Accounts</button>
      <button class="warning" onclick="runSync()">Run Sync Now</button>
      <button class="secondary" onclick="openSheet()">Open Google Sheet</button>
      <button class="secondary" onclick="showText(`{escaped_guidance}`)">U.S. Bank / New Bank Instructions</button>
      <button class="secondary" onclick="copyChecklist()">Copy Apps Script Redeploy Checklist</button>
    </section>
    <pre id="output">Loading status...</pre>
  </main>
  <script>
    const checklist = `{escaped_checklist}`;

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

    function renderCards(status) {{
      const cards = [
        ['Plaid', `${{status.config.plaid_env}}`, `${{status.config.token_count}} configured token(s)`],
        ['Google Sheet', status.sheet.configured ? 'Configured' : 'Missing', status.sheet.sheet_name],
        ['Doctor', status.doctor.ok ? 'No failures' : 'Needs attention', `${{status.doctor.checks.length}} check(s)`],
        ['Plaid Blocker', 'U.S. Bank deferred', 'Blocked until OAuth institution registration is ready']
      ];
      document.getElementById('cards').innerHTML = cards.map(card => `
        <article class="card">
          <h2>${{card[0]}}</h2>
          <div class="metric">${{card[1]}}</div>
          <div class="muted">${{card[2]}}</div>
        </article>
      `).join('');
    }}

    async function loadStatus() {{
      const status = await api('/api/status');
      renderCards(status);
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
    }}

    async function runSync() {{
      if (!confirm('Run a live sync now? This can append new rows to Google Sheets.')) {{
        return;
      }}
      setOutput('Running sync...');
      const result = await api('/api/sync', {{
        method: 'POST',
        headers: {{ 'Content-Type': 'application/json' }},
        body: JSON.stringify({{ confirm: true }})
      }});
      setOutput((result.ok ? 'Sync completed.' : 'Sync failed.') + '\\n\\n' + (result.output || 'No output.'));
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
        self._send_json({'error': 'Not found'}, status=404)

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            if path == '/api/doctor':
                self._send_json(run_doctor_command(self.root, self._env(), skip_network=True))
                return
            if path == '/api/sync':
                payload = self._read_json()
                self._send_json(run_sync_command(
                    confirm=payload.get('confirm') is True,
                    root=self.root,
                    env=self._env(),
                ))
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
