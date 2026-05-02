import json

from src.engine.appscript_deploy import (
    APPS_SCRIPT_SCOPE,
    AppScriptDeployError,
    build_update_payload,
    compare_managed_files,
    format_deploy_error,
    format_deploy_report,
    load_local_sources,
    run_deploy_plan,
)


def test_load_local_sources_finds_code_and_sidebar():
    sources = load_local_sources()

    assert sources['Code']['type'] == 'SERVER_JS'
    assert 'function onOpen' in sources['Code']['source']
    assert sources['Sidebar']['type'] == 'HTML'
    assert '<!DOCTYPE html>' in sources['Sidebar']['source']


def test_update_payload_preserves_remote_manifest():
    local = {
        'Code': {'name': 'Code', 'type': 'SERVER_JS', 'source': 'function onOpen() {}'},
        'Sidebar': {'name': 'Sidebar', 'type': 'HTML', 'source': '<html></html>'},
    }
    remote = [
        {'name': 'appsscript', 'type': 'JSON', 'source': '{"timeZone":"America/Chicago"}'},
        {'name': 'Code', 'type': 'SERVER_JS', 'source': 'old'},
        {'name': 'Sidebar', 'type': 'HTML', 'source': 'old'},
    ]

    payload = build_update_payload(local, remote)

    files = {item['name']: item for item in payload['files']}
    assert files['Code']['type'] == 'SERVER_JS'
    assert files['Sidebar']['type'] == 'HTML'
    assert files['appsscript']['source'] == '{"timeZone":"America/Chicago"}'


def test_unknown_remote_files_refuse_by_default():
    local = {
        'Code': {'name': 'Code', 'type': 'SERVER_JS', 'source': 'new'},
        'Sidebar': {'name': 'Sidebar', 'type': 'HTML', 'source': 'new'},
    }
    remote = [{'name': 'Unexpected', 'type': 'SERVER_JS', 'source': 'do not delete'}]

    try:
        build_update_payload(local, remote)
    except AppScriptDeployError as exc:
        assert 'Unexpected' in str(exc)
    else:
        raise AssertionError('unexpected remote files should refuse deployment')


def test_unknown_remote_files_can_be_allowed():
    local = {
        'Code': {'name': 'Code', 'type': 'SERVER_JS', 'source': 'new'},
        'Sidebar': {'name': 'Sidebar', 'type': 'HTML', 'source': 'new'},
    }
    remote = [{'name': 'Unexpected', 'type': 'SERVER_JS', 'source': 'keep'}]

    payload = build_update_payload(local, remote, allow_unmanaged=True)

    assert {item['name'] for item in payload['files']} == {'Code', 'Sidebar', 'Unexpected'}


def test_compare_managed_files_reports_changed_and_unchanged():
    local = {
        'Code': {'name': 'Code', 'type': 'SERVER_JS', 'source': 'same'},
        'Sidebar': {'name': 'Sidebar', 'type': 'HTML', 'source': 'new'},
    }
    remote = [
        {'name': 'Code', 'type': 'SERVER_JS', 'source': 'same'},
        {'name': 'Sidebar', 'type': 'HTML', 'source': 'old'},
    ]

    comparison = compare_managed_files(local, remote)

    assert comparison['Code']['status'] == 'unchanged'
    assert comparison['Sidebar']['status'] == 'changed'
    assert comparison['Sidebar']['local_hash'] != comparison['Sidebar']['remote_hash']


def test_missing_script_id_dry_run_returns_manual_fallback():
    report = run_deploy_plan({'GOOGLE_APPS_SCRIPT_ID': ''}, dry_run=True, service_factory=None)

    assert report['ok'] is False
    assert report['reason'] == 'missing_script_id'
    assert 'GOOGLE_APPS_SCRIPT_ID' in report['message']
    assert 'manual' in report['fallback'].lower()


def test_dry_run_does_not_update_remote_project():
    class FakeProjects:
        def __init__(self):
            self.updated = False

        def getContent(self, scriptId):
            return self

        def updateContent(self, scriptId, body):
            self.updated = True
            return self

        def execute(self):
            return {'files': [
                {'name': 'appsscript', 'type': 'JSON', 'source': '{}'},
                {'name': 'Code', 'type': 'SERVER_JS', 'source': 'old'},
                {'name': 'Sidebar', 'type': 'HTML', 'source': 'old'},
            ]}

    class FakeService:
        def __init__(self):
            self.projects_resource = FakeProjects()

        def projects(self):
            return self.projects_resource

    service = FakeService()

    report = run_deploy_plan(
        {'GOOGLE_APPS_SCRIPT_ID': 'script_123'},
        dry_run=True,
        service_factory=lambda: service,
    )

    assert report['ok'] is True
    assert report['dry_run'] is True
    assert service.projects_resource.updated is False


def test_push_updates_remote_project_when_confirmed():
    class FakeRequest:
        def __init__(self, payload):
            self.payload = payload

        def execute(self):
            return self.payload

    class FakeProjects:
        def __init__(self):
            self.updated_body = None

        def getContent(self, scriptId):
            return FakeRequest({'files': [
                {'name': 'appsscript', 'type': 'JSON', 'source': '{}'},
                {'name': 'Code', 'type': 'SERVER_JS', 'source': 'old'},
                {'name': 'Sidebar', 'type': 'HTML', 'source': 'old'},
            ]})

        def updateContent(self, scriptId, body):
            self.updated_body = body
            return FakeRequest({'files': body['files']})

    class FakeService:
        def __init__(self):
            self.projects_resource = FakeProjects()

        def projects(self):
            return self.projects_resource

    service = FakeService()

    report = run_deploy_plan(
        {'GOOGLE_APPS_SCRIPT_ID': 'script_123'},
        dry_run=False,
        service_factory=lambda: service,
        confirmed=True,
    )

    assert report['ok'] is True
    assert report['updated'] is True
    assert service.projects_resource.updated_body is not None
    assert 'Refresh Dashboard & Visuals' in report['next_step']


def test_push_requires_confirmation():
    try:
        run_deploy_plan(
            {'GOOGLE_APPS_SCRIPT_ID': 'script_123'},
            dry_run=False,
            service_factory=lambda: None,
            confirmed=False,
        )
    except AppScriptDeployError as exc:
        assert 'confirmation' in str(exc).lower()
    else:
        raise AssertionError('push should require confirmation')


def test_format_deploy_report_masks_script_id_and_mentions_scope():
    report = {
        'ok': True,
        'script_id': 'script_123456',
        'dry_run': True,
        'comparison': {
            'Code': {'status': 'changed', 'local_hash': 'abc', 'remote_hash': 'def'},
        },
        'unmanaged_remote_files': [],
        'next_step': 'Reload and refresh.',
    }

    output = format_deploy_report(report, env={'GOOGLE_APPS_SCRIPT_ID': 'script_123456'})

    assert 'script_123456' not in output
    assert '[masked]' in output
    assert APPS_SCRIPT_SCOPE in output


def test_format_deploy_error_masks_script_id():
    output = format_deploy_error(
        Exception('Google error for script_123456'),
        env={'GOOGLE_APPS_SCRIPT_ID': 'script_123456'},
    )

    assert 'script_123456' not in output
    assert '[masked]' in output
    assert 'Manual Apps Script fallback' in output
