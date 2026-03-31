import datetime

from src.engine.sync_utils import coerce_sheet_date_value, extract_existing_ids


def test_coerce_sheet_date_value_accepts_serial_numbers():
    assert coerce_sheet_date_value(46110) == datetime.date(2026, 3, 29)


def test_coerce_sheet_date_value_accepts_iso_strings():
    assert coerce_sheet_date_value("2026-03-29") == datetime.date(2026, 3, 29)


def test_extract_existing_ids_strips_blanks():
    values = [[" txn_1 "], [""], ["txn_2"], [], ["   "]]
    assert extract_existing_ids(values) == {"txn_1", "txn_2"}
