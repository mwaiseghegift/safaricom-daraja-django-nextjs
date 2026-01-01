# Safaricom Daraja API – Developer Codes & Reference

This document is a **developer-focused cheat sheet** of the most important **codes, identifiers, and response values** you must understand when integrating with the **Safaricom M-Pesa Daraja API**.

It is distilled from the official Daraja documentation and optimized for **backend & full-stack developers**.

---

## Table of Contents

- [Safaricom Daraja API – Developer Codes \& Reference](#safaricom-daraja-api--developer-codes--reference)
  - [Table of Contents](#table-of-contents)
  - [HTTP \& Platform Status Codes](#http--platform-status-codes)
  - [OAuth Authorization Codes](#oauth-authorization-codes)
    - [OAuth Endpoint](#oauth-endpoint)
    - [Token Properties](#token-properties)
    - [OAuth Error Codes](#oauth-error-codes)
  - [CommandID Reference](#commandid-reference)
  - [IdentifierType Codes](#identifiertype-codes)
  - [Transaction Type Codes (TrxCode)](#transaction-type-codes-trxcode)
  - [Daraja API Response Codes](#daraja-api-response-codes)
  - [Callback Result Codes](#callback-result-codes)
    - [ResultCode Values](#resultcode-values)
  - [Throttling \& Rate Limiting Codes](#throttling--rate-limiting-codes)
  - [Account Balance Result Keys](#account-balance-result-keys)
    - [Balance Format](#balance-format)
  - [Security \& Encryption Rules](#security--encryption-rules)
    - [SecurityCredential Generation](#securitycredential-generation)
    - [API User Password Rules](#api-user-password-rules)
  - [Callback IP Whitelisting](#callback-ip-whitelisting)
  - [TL;DR – Must-Know Codes](#tldr--must-know-codes)
  - [Recommended Next Steps](#recommended-next-steps)

---

## HTTP & Platform Status Codes

Used across **all Daraja APIs**.

| HTTP Code | Meaning |
|---------|--------|
| 200 | Request accepted successfully |
| 400 | Bad request (missing or invalid parameters) |
| 401 | Invalid or expired OAuth token |
| 404 | Wrong API endpoint |
| 405 | Invalid HTTP method (must be POST for most APIs) |
| 500 | Internal error / throttling / duplicate request |

---

## OAuth Authorization Codes

### OAuth Endpoint

`GET /oauth/v1/generate?grant_type=client_credentials`


### Token Properties
- Token expiry: **3600 seconds (1 hour)**
- Generating a new token **invalidates the previous one**

### OAuth Error Codes

| Code | Meaning |
|----|-------|
| 400.008.01 | Invalid authorization type (must be Basic Auth) |
| 400.008.02 | Invalid grant type (must be `client_credentials`) |

---

## CommandID Reference

`CommandID` tells M-Pesa **what operation you are performing**.

| CommandID | Description |
|----------|------------|
| AccountBalance | Query organization account balance |
| SalaryPayment | B2C salary payments |
| BusinessPayment | B2C business payments |
| PromotionPayment | B2C promotional payouts |
| TransactionStatusQuery | Query transaction status |
| Reversal | Reverse a transaction |

---

## IdentifierType Codes

Defines **what PartyA represents**.

| IdentifierType | Meaning |
|---------------|--------|
| 1 | MSISDN (Phone Number) |
| 2 | Till Number |
| 4 | Shortcode (PayBill / Organization) |

> ⚠️ For **Account Balance**, IdentifierType is almost always `4`.

---

## Transaction Type Codes (TrxCode)

Used mainly in **Dynamic QR** and Lipa na M-Pesa flows.

| TrxCode | Meaning |
|--------|--------|
| BG | Buy Goods |
| PB | Pay Bill |
| WA | Withdraw Cash (Agent) |
| SM | Send Money |
| SB | Send to Business |

---

## Daraja API Response Codes

Returned **immediately** after submitting a request.

| Field | Meaning |
|-----|-------|
| ResponseCode = 0 | Request accepted |
| ResponseCode ≠ 0 | Request rejected |

Important identifiers:
- **OriginatorConversationID** – Your request reference
- **ConversationID** – M-Pesa internal reference

---

## Callback Result Codes

Returned asynchronously to your `ResultURL`.

### ResultCode Values

| ResultCode | Meaning |
|-----------|--------|
| 0 | Transaction successful |
| 1 | Transaction failed |
| 17 | Internal system failure |
| 18 | Initiator credential error |
| 20 | Initiator not found |
| 21 | Initiator permission error |
| 24 | Missing mandatory fields |
| 29 | Invalid CommandID |

---

## Throttling & Rate Limiting Codes

| Code | Meaning |
|----|--------|
| 500.003.02 | Spike arrest (too many requests per second) |
| 500.003.03 | Quota violation |
| 100000011 | Request rate exceeded |
| 26 | System too busy |

---

## Account Balance Result Keys

Returned inside `ResultParameters`.

| Account | Purpose |
|-------|--------|
| Working Account | MMF / settlement account |
| Utility Account | PayBill collections |
| Charges Paid Account | Transaction charges |
| Organization Settlement Account | Settlement staging |

### Balance Format

`AccountName|Currency|Available|Uncleared|Reserved|Balance`


---

## Security & Encryption Rules

### SecurityCredential Generation
- RSA encryption
- **PKCS#1 v1.5 padding**
- Base64 encoded
- Uses **Safaricom public certificate**
- Sandbox and Production certificates are **different**

### API User Password Rules
- Avoid special characters like `@` and `.`
- Password validity: **90 days**
- Must be set by a Business Manager

---

## Callback IP Whitelisting

Your callback URLs **must allow traffic only from Safaricom IPs**:

```plaintext
196.201.214.200
196.201.214.206
196.201.213.114
196.201.214.207
196.201.214.208
196.201.213.44
196.201.212.127
196.201.212.138
196.201.212.129
196.201.212.136
196.201.212.74
196.201.212.69
```


---

## TL;DR – Must-Know Codes

If you remember nothing else, remember these:

- `client_credentials`
- `CommandID`
- `IdentifierType = 4`
- `ResponseCode = 0`
- `ResultCode = 0`
- `OriginatorConversationID`
- `ConversationID`
- `TrxCode (BG / PB)`
- `401.002.01` – expired token
- `500.003.02` – rate limiting

---

## Recommended Next Steps

- Implement **token caching**
- Log **ConversationID & OriginatorConversationID**
- Handle callbacks asynchronously
- Add retry logic for **rate-limit errors**
- Enforce IP whitelisting in production

---
