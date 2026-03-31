import datetime

from src.engine.sync_utils import determine_sync_window


def test_determine_sync_window_returns_incremental_range():
    start_date, end_date, mode = determine_sync_window(
        "2026-03-29",
        today=datetime.date(2026, 3, 30),
    )

    assert mode == "incremental"
    assert start_date == datetime.date(2026, 3, 28)
    assert end_date == datetime.date(2026, 3, 30)


def test_determine_sync_window_falls_back_for_invalid_dates():
    start_date, end_date, mode = determine_sync_window(
        "not-a-date",
        today=datetime.date(2026, 3, 30),
        lookback_days=30,
    )

    assert mode == "bootstrap"
    assert start_date == datetime.date(2026, 2, 28)
    assert end_date == datetime.date(2026, 3, 30)
