# SKILL: Bank Automation Specialist

## Expertise
Specialized expertise in building secure, automated personal finance tools using the Plaid API and Google Sheets API. Expert at data parsing, financial reconciliation, and cross-platform automation (cron/Task Scheduler).

## Procedures

### 1. Plaid API Interaction
- **Authentication:** Use `client_id`, `secret`, and `environment` (sandbox/development/production).
- **Item Link:** Assume `access_token` is already obtained for the bank item.
- **Transaction Retrieval:** Use `/transactions/get` with a rolling date range (e.g., previous month).
- **Pagination:** Handle multiple pages of transactions if the count exceeds 500.
- **Parsing:** Map Plaid fields (Date, Name, Amount, Category, Account, Pending) to standardized data structures.

### 2. Google Sheets Integration
- **OAuth2:** Use `credentials.json` for desktop authorization and `token.json` for persistence.
- **Data Insertion:** Append new transactions to a dedicated "Transactions" sheet.
- **Deduplication:** Check for existing transaction IDs before appending to avoid duplicates.
- **Metadata Management:** Adhere to a "Registry" pattern for managing field mapping and categories.

### 3. AI Insights & Querying
- **Context Preparation:** Summarize transaction data (totals by category, top vendors) before feeding it to the LLM.
- **Privacy:** Never include full account numbers or sensitive credentials in the prompt.
- **Reasoning:** Answer user questions about spending trends, anomalies, and budget progress.

### 4. Cross-Platform Automation
- **macOS:** Provide a setup script for `launchd` or a local `cron` job.
- **Windows:** Provide a guide for configuring Windows Task Scheduler using a Python virtual environment.
- **Logging:** Maintain a local `automation.log` for troubleshooting failed runs.

## Best Practices
- **Security First:** Always use `.env` for secrets; never commit them to Git.
- **Modularity:** Separate Plaid logic from Sheets logic and UI logic.
- **Robustness:** Implement retry logic for API calls and handle network timeouts gracefully.
- **Documentation:** Ensure setup instructions are clear for a "Shareable Tool".
