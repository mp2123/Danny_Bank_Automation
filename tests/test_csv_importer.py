import csv

from src.engine.csv_importer import (
    DEFAULT_MANUAL_INCOME_CATEGORY,
    ManualIncomeImportError,
    dedupe_import_rows,
    generate_manual_id,
    is_forbidden_income_category,
    normalize_date,
    parse_manual_income_csv,
    parse_money,
    run_manual_income_import,
    summarize_import,
)


def write_csv(path, rows):
    with path.open('w', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=['date', 'name', 'amount', 'category', 'account', 'notes'])
        writer.writeheader()
        writer.writerows(rows)


def test_parse_money_accepts_common_positive_formats():
    assert parse_money('$2,500.00') == 2500.0
    assert parse_money('2500') == 2500.0
    assert parse_money('+2500.00') == 2500.0


def test_normalize_date_accepts_common_date_formats():
    assert normalize_date('2026-04-30') == '2026-04-30'
    assert normalize_date('04/30/2026') == '2026-04-30'
    assert normalize_date('Apr 30 2026') == '2026-04-30'


def test_manual_income_outputs_transaction_rows(tmp_path):
    path = tmp_path / 'income.csv'
    write_csv(path, [{
        'date': '2026-04-30',
        'name': 'ACME Payroll',
        'amount': '$2,500.00',
        'category': '',
        'account': '',
        'notes': 'April paycheck',
    }])

    rows = parse_manual_income_csv(path, default_account='Manual Income')

    assert len(rows) == 1
    assert rows[0][0].startswith('manual_income_')
    assert rows[0][1:] == [
        '2026-04-30',
        'ACME Payroll',
        2500.0,
        DEFAULT_MANUAL_INCOME_CATEGORY,
        'Manual Income',
        'FALSE',
    ]


def test_negative_manual_income_is_rejected_by_default(tmp_path):
    path = tmp_path / 'income.csv'
    write_csv(path, [{
        'date': '2026-04-30',
        'name': 'Bad Row',
        'amount': '-2500.00',
        'category': 'Income > Payroll',
        'account': 'Manual Income',
        'notes': '',
    }])

    try:
        parse_manual_income_csv(path)
    except ManualIncomeImportError as exc:
        assert 'negative' in str(exc).lower()
    else:
        raise AssertionError('negative manual income should be rejected')


def test_manual_ids_are_stable_after_normalization():
    first = generate_manual_id('04/30/2026', 'ACME Payroll', '$2,500.00', 'Manual Income', 'Income > Payroll')
    second = generate_manual_id('2026-04-30', ' ACME   Payroll ', '2500', 'Manual Income', 'Income > Payroll')

    assert first == second


def test_manual_ids_include_account_and_category_to_avoid_collisions():
    base = generate_manual_id('2026-04-30', 'ACME Payroll', '2500', 'Manual Income', 'Income > Payroll')
    other_account = generate_manual_id('2026-04-30', 'ACME Payroll', '2500', 'Other Income', 'Income > Payroll')
    other_category = generate_manual_id('2026-04-30', 'ACME Payroll', '2500', 'Manual Income', 'Income > Bonus')

    assert base != other_account
    assert base != other_category


def test_batch_and_existing_dedupe_work(tmp_path):
    path = tmp_path / 'income.csv'
    write_csv(path, [
        {'date': '2026-04-30', 'name': 'ACME Payroll', 'amount': '2500', 'category': '', 'account': '', 'notes': ''},
        {'date': '04/30/2026', 'name': ' ACME   Payroll ', 'amount': '$2,500.00', 'category': '', 'account': '', 'notes': ''},
        {'date': '2026-05-15', 'name': 'ACME Payroll', 'amount': '2500', 'category': '', 'account': '', 'notes': ''},
    ])
    rows = parse_manual_income_csv(path)
    existing_id = rows[2][0]

    result = dedupe_import_rows(rows, existing_ids={existing_id})

    assert len(result['new_rows']) == 1
    assert result['skipped_batch_duplicates'] == 1
    assert result['skipped_existing'] == 1


def test_summarize_import_reports_counts():
    summary = summarize_import(total_rows=3, new_rows=[[1], [2]], skipped_existing=1, skipped_batch_duplicates=0, dry_run=True)

    assert summary['total_rows'] == 3
    assert summary['new_rows'] == 2
    assert summary['skipped_existing'] == 1
    assert summary['dry_run'] is True


def test_dry_run_does_not_append(tmp_path):
    path = tmp_path / 'income.csv'
    write_csv(path, [{'date': '2026-04-30', 'name': 'ACME Payroll', 'amount': '2500', 'category': '', 'account': '', 'notes': ''}])

    class FakeClient:
        appended = False

        def authenticate(self):
            return object()

        def get_existing_ids(self, creds):
            return set()

        def append_data(self, creds, rows):
            self.appended = True
            return True

    result = run_manual_income_import(path, dry_run=True, sheets_client_factory=lambda *_args: FakeClient())

    assert result['summary']['new_rows'] == 1
    assert result['appended'] is False


def test_confirmed_import_appends_only_new_rows(tmp_path):
    path = tmp_path / 'income.csv'
    write_csv(path, [
        {'date': '2026-04-30', 'name': 'ACME Payroll', 'amount': '2500', 'category': '', 'account': '', 'notes': ''},
        {'date': '2026-05-15', 'name': 'ACME Payroll', 'amount': '2500', 'category': '', 'account': '', 'notes': ''},
    ])
    rows = parse_manual_income_csv(path)
    appended_rows = []

    class FakeClient:
        def authenticate(self):
            return object()

        def get_existing_ids(self, creds):
            return {rows[0][0]}

        def append_data(self, creds, rows_to_append):
            appended_rows.extend(rows_to_append)
            return True

    result = run_manual_income_import(
        path,
        dry_run=False,
        confirm=True,
        sheets_client_factory=lambda *_args: FakeClient(),
    )

    assert result['appended'] is True
    assert len(appended_rows) == 1
    assert appended_rows[0][0] == rows[1][0]


def test_default_manual_income_category_is_not_transfer_or_payment_like():
    assert is_forbidden_income_category(DEFAULT_MANUAL_INCOME_CATEGORY) is False
    assert is_forbidden_income_category('Transfer In > Account Transfer') is True
    assert is_forbidden_income_category('Loan Payments > Credit Card Payment') is True
