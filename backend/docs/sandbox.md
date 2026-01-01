# Daraja Sandbox – Test Codes & Numbers

This document lists **all shortcodes, phone numbers, and identifiers** to be used **ONLY** when integrating with the **Safaricom Daraja Sandbox**.

> ⚠️ These values **DO NOT work in production**  
> ⚠️ No real money is transacted in sandbox  
> ⚠️ Sandbox auto-approves transactions (no real PIN entry)

---

## Base Sandbox URL

```plain
https://sandbox.safaricom.co.ke/
```


---

## Default Sandbox Shortcodes

### PayBill / Organization Shortcode

`174379`


**Used for:**
- STK Push (Lipa Na M-Pesa)
- Account Balance
- C2B simulations
- Transaction Status queries
- Reversals

This is the **primary shortcode** for most sandbox APIs.

---

### Buy Goods / Till Number

`373132`


**Used for:**
- Buy Goods transactions
- Dynamic QR (`BG`)
- Till-based payments

---

## Sandbox Test Phone Numbers (MSISDN)

### Default Test Phone Number

`254708374149`


**Used for:**
- STK Push simulations
- C2B payments
- Customer-initiated flows

**Rules:**
- Format: `2547XXXXXXXX`
- No `+`
- No leading `0`
- Do NOT use real phone numbers

---

## IdentifierType Reference (Sandbox)

| IdentifierType | Meaning | Example |
|---------------|--------|--------|
| `1` | MSISDN | `254708374149` |
| `2` | Till Number | `373132` |
| `4` | PayBill / Shortcode | `174379` |

---

## Common Sandbox API Examples

### STK Push (Lipa Na M-Pesa)

```json
{
  "BusinessShortCode": "174379",
  "PartyA": "254708374149",
  "PartyB": "174379",
  "PhoneNumber": "254708374149",
  "TransactionType": "CustomerPayBillOnline",
  "Amount": 1
}
```

### Account Balance Request

{
  "Initiator": "testapiuser",
  "CommandID": "AccountBalance",
  "PartyA": "174379",
  "IdentifierType": "4",
  "Remarks": "sandbox test",
  "QueueTimeOutURL": "https://example.com/timeout",
  "ResultURL": "https://example.com/result"
}

### Dynamic QR (Sandbox)

```json
{
  "MerchantName": "TEST MERCHANT",
  "RefNo": "INV-001",
  "Amount": 1,
  "TrxCode": "BG",
  "CPI": "373132",
  "Size": "300"
}
```

### Sandbox Credential Summary

| Item                       | Sandbox Value  |
| -------------------------- | -------------- |
| PayBill / Shortcode        | `174379`       |
| Till Number                | `373132`       |
| Test Phone Number          | `254708374149` |
| Currency                   | `KES`          |
| IdentifierType (Shortcode) | `4`            |
| IdentifierType (MSISDN)    | `1`            |

### TL;DR – Use These in Sandbox

```plain
PayBill Shortcode: 174379
Till Number:       373132
Phone Number:      254708374149
IdentifierType:    4
Environment:       Sandbox
```






