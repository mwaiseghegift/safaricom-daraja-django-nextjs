# Clean and Format Safaricom Daraja API Documentation Files

The documentation files in the `documentation/` folder are currently in a messy HTML-embedded format, copied from the Safaricom developer portal. They contain Material-UI classes, inline styles, and HTML tags that make them hard to read and maintain.

**Task:** Clean and format the following .md files into clean, readable Markdown content.

**Files to process:**
- documentation/account-balance/account-balance.md
- documentation/B2BExpressCheckout/B2BExpressCheckout.md
- documentation/b2c/b2c.md
- documentation/B2CAccountTopUp/B2CAccountTopUp.md
- documentation/BillManager/BillManager.md
- documentation/BusinessBuyGoods/BusinessBuyGoods.md
- documentation/BusinessPayBill/BusinessPayBill.md
- documentation/BusinessToPochi/BusinessToPochi.md
- documentation/c2b/c2b.md
- documentation/CustomerToBusinessRegisterURL/CustomerToBusinessRegisterURL.md
- documentation/IMSI/IMSI.md
- documentation/IotSimManagement/IotSimManagement.md
- documentation/MpesaRatiba/MpesaRatiba.md
- documentation/PullTransaction/PullTransaction.md
- documentation/reversals/reversals.md
- documentation/Swap/Swap.md
- documentation/TaxRemittance/TaxRemittance.md

**Steps for each file:**
1. Remove all HTML tags, CSS classes, inline styles, and unnecessary elements (e.g., breadcrumbs, buttons, images, navigation menus).
2. Extract key content: API title, description, endpoint URL, overview, how it works, getting started, integration steps, go live, how to, support, request/response examples, parameters, error codes, etc.
3. Format as proper Markdown:
   - Use `#` for the main title.
   - Use `##` for major sections (e.g., ## Overview).
   - Use code blocks (```json) for JSON examples, URLs, or code snippets.
   - Use tables for parameters, headers, or structured data.
   - Keep any valid links or references.
4. Ensure the output is concise, readable, and follows Markdown best practices (e.g., no extra whitespace, consistent formatting).
5. Preserve all important technical details like API endpoints, authentication, request/response formats, and error handling.

This will make the documentation more maintainable, easier to read, and suitable for version control or publishing.

Assign this issue to Copilot for implementation.
