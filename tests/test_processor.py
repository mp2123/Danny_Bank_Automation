from src.engine.processor import TransactionProcessor
from src.engine.account_labels import build_account_label


def test_parse_plaid_transactions_dedupes_within_batch_and_formats_fields():
    processor = TransactionProcessor()
    transactions = [
        {
            "transaction_id": "txn_1",
            "date": "2026-03-29",
            "name": "Coffee Shop",
            "amount": 12.5,
            "personal_finance_category": {
                "primary": "FOOD_AND_DRINK",
                "detailed": "FOOD_AND_DRINK_COFFEE"
            },
            "category": ["Food and Drink"],
            "account_id": "acct_123",
            "pending": False,
        },
        {
            "transaction_id": "txn_1",
            "date": "2026-03-29",
            "name": "Coffee Shop",
            "amount": 12.5,
            "personal_finance_category": {
                "primary": "FOOD_AND_DRINK",
                "detailed": "FOOD_AND_DRINK_COFFEE"
            },
            "category": ["Food and Drink"],
            "account_id": "acct_123",
            "pending": False,
        },
    ]

    parsed = processor.parse_plaid_transactions(transactions, existing_ids=set())

    assert parsed == [[
        "txn_1",
        "2026-03-29",
        "Coffee Shop",
        -12.5,
        "FOOD_AND_DRINK > FOOD_AND_DRINK_COFFEE",
        "acct_123",
        False,
    ]]


def test_parse_plaid_transactions_uses_friendly_account_labels_when_available():
    processor = TransactionProcessor()
    transactions = [{
        "transaction_id": "txn_2",
        "date": "2026-03-30",
        "name": "Groceries",
        "amount": 42.0,
        "personal_finance_category": None,
        "category": ["Shops"],
        "account_id": "acct_abc",
        "pending": False,
    }]

    parsed = processor.parse_plaid_transactions(
        transactions,
        existing_ids=set(),
        account_labels={"acct_abc": "American Express - Gold Card ending 2003"},
    )

    assert parsed[0][5] == "American Express - Gold Card ending 2003"


def test_build_account_label_cleans_mask_suffix_and_registered_mark():
    label = build_account_label(
        "American Express",
        {
            "name": "Blue Cash Preferred® ...2005",
            "official_name": "",
            "mask": "2005",
        },
    )

    assert label == "American Express - Blue Cash Preferred ending 2005"
