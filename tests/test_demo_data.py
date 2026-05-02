import json

from src.engine.demo_data import (
    DemoDataError,
    parse_demo_transactions,
    summarize_demo_data,
)


def test_demo_fixture_summary_calculates_cashflow():
    summary = summarize_demo_data()

    assert summary['ok'] is True
    assert summary['synthetic'] is True
    assert summary['summary']['total_income'] == 8400.0
    assert summary['summary']['total_spend'] == 2370.72
    assert summary['summary']['net_cashflow'] == 6029.28
    assert summary['summary']['savings_rate'] == 71.8
    assert summary['top_accounts'][0]['name'] == 'Demo Checking'


def test_demo_fixture_rows_are_visibly_synthetic():
    rows = parse_demo_transactions()

    assert rows
    assert all(row.transaction_id.startswith('demo_') for row in rows)
    assert all(('DEMO' in row.name or 'Demo' in row.account) for row in rows)


def test_demo_parser_rejects_missing_required_columns(tmp_path):
    path = tmp_path / 'bad_demo.csv'
    path.write_text('Transaction ID,Date,Name\n')

    try:
        parse_demo_transactions(path)
    except DemoDataError as exc:
        assert 'missing required column' in str(exc)
    else:
        raise AssertionError('demo parser should reject missing columns')


def test_demo_summary_contains_no_known_secret_shapes():
    serialized = json.dumps(summarize_demo_data())

    assert 'access-' not in serialized
    assert 'PLAID_SECRET' not in serialized
    assert 'GEMINI_API_KEY' not in serialized
    assert 'GOOGLE_SPREADSHEET_ID' not in serialized
