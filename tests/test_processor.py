from src.engine.processor import TransactionProcessor


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
