# Safaricom Daraja API - Django & Next.js Sample Implementation

A comprehensive sample implementation of Safaricom's Daraja API using Django (backend) and Next.js (frontend). This repository demonstrates how to integrate and consume all M-Pesa API endpoints for payment processing, transaction management, and more.

## Overview

This project provides ready-to-use code samples for integrating Safaricom's M-Pesa payment gateway into your applications. It includes implementations for all major Daraja API endpoints, from basic authentication to complex payment workflows.

**Tech Stack:**
- **Backend**: Django (Python)
- **Frontend**: Next.js (TypeScript/React)
- **API**: Safaricom Daraja REST APIs

## Prerequisites

- Python 3.8+
- Node.js 18+
- Safaricom Developer Account ([Sign up here](https://developer.safaricom.co.ke/))
- Consumer Key & Consumer Secret from Daraja Portal
- M-Pesa Shortcode (for production)

## Installation

### Backend Setup (Django)

```bash
cd backend
python -m venv env
source env/bin/activate  # On Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## Authentication

All Daraja APIs require OAuth 2.0 authentication. You must first obtain an access token before making any API calls.

**Endpoint:** `GET /oauth/v1/generate?grant_type=client_credentials`

- **Sandbox:** `https://sandbox.safaricom.co.ke`
- **Production:** `https://api.safaricom.co.ke`

[View detailed documentation](./documentation/2.authorization.md)

## Available API Endpoints

### 1. **Account Balance**
Query the balance on an M-Pesa BuyGoods (Till Number) account.

**Endpoint:** `POST /mpesa/accountbalance/v1/query`

**Use Case:** Check available balance for business accounts

[View Documentation](./documentation/account-balance/account-balance.md)

---

### 2. **B2B Express Checkout**
Initiate USSD push to till, enabling merchants to pay from their till numbers to vendor paybills.

**Endpoint:** `POST /v1/ussdpush/get-msisdn`

**Use Case:** Business-to-business payments via USSD push

[View Documentation](./documentation/B2BExpressCheckout/B2BExpressCheckout.md)

---

### 3. **Business to Customer (B2C)**
Transfer funds from business account to customer phone numbers.

**Endpoint:** `POST /mpesa/b2c/v3/paymentrequest`

**Use Case:** Salary payments, refunds, disbursements

[View Documentation](./documentation/b2c/b2c.md)

---

### 4. **B2C Account Top Up**
Load funds to a B2C shortcode directly for disbursement.

**Endpoint:** `POST /mpesa/b2b/v1/paymentrequest`

**Use Case:** Fund business accounts for B2C transactions

[View Documentation](./documentation/B2CAccountTopUp/B2CAccountTopUp.md)

---

### 5. **Bill Manager**
One-stop platform to send, receive, pay, and reconcile all payments.

**Use Case:** Comprehensive bill management and reconciliation

[View Documentation](./documentation/BillManager/BillManager.md)

---

### 6. **Business Buy Goods**
Pay for goods and services from business account to till number or merchant store.

**Endpoint:** `POST /mpesa/b2b/v1/paymentrequest`

**Use Case:** Business purchases, inventory payments

[View Documentation](./documentation/BusinessBuyGoods/BusinessBuyGoods.md)

---

### 7. **Business Pay Bill**
Pay bills directly from business account to paybill numbers.

**Endpoint:** `POST /mpesa/b2b/v1/paymentrequest`

**Use Case:** Utility payments, supplier payments

[View Documentation](./documentation/BusinessPayBill/BusinessPayBill.md)

---

### 8. **Business to Pochi**
Transfer funds from business to customer's business wallet (Pochi la Biashara/microSME).

**Endpoint:** `POST /mpesa/b2pochi/v1/paymentrequest`

**Use Case:** Payments to micro-business wallets

[View Documentation](./documentation/BusinessToPochi/BusinessToPochi.md)

---

### 9. **Customer to Business (C2B)**
Register URLs for validation/confirmation and simulate C2B transactions.

**Endpoint:** `POST /mpesa/c2b/v2/registerurl`

**Use Case:** Accept customer payments to business shortcode

[View Documentation](./documentation/c2b/c2b.md)

---

### 10. **Customer to Business Register URL**
Register validation and confirmation URLs on M-Pesa.

**Endpoint:** `POST /mpesa/c2b/v1/registerurl`

**Use Case:** Setup callback URLs for payment notifications

[View Documentation](./documentation/CustomerToBusinessRegisterURL/CustomerToBusinessRegisterURL.md)

---

### 11. **Dynamic QR**
Generate dynamic QR codes for M-Pesa payments.

**Use Case:** QR-based payment collection

[View Documentation](./documentation/3.dynamic_qr.md)

---

### 12. **IMSI**
Verify Safaricom number age, registration date, hashed IMSI, and last SIM swap.

**Endpoint:** `POST /imsi/v1/checkATI`

**Use Case:** Fraud prevention, customer verification

[View Documentation](./documentation/IMSI/IMSI.md)

---

### 13. **IoT SIM Management**
Manage IoT SIM cards - activation, monitoring, messaging, and control.

**Endpoint:** `POST /simportal/{path_suffix}`

**Use Case:** IoT device connectivity management

[View Documentation](./documentation/IotSimManagement/IotSimManagement.md)

---

### 14. **M-Pesa Express (STK Push)**
Initiate online payment on behalf of customers.

**Endpoints:**
- **Simulate:** `POST /mpesa/stkpush/v1/processrequest`
- **Query:** `POST /mpesa/stkpushquery/v1/query`

**Use Case:** Online checkout, e-commerce payments

[View Simulate Documentation](./documentation/mpesa-express/mpesa-express-simulate.md)  
[View Query Documentation](./documentation/mpesa-express/mpesa-express-query.md)

---

### 15. **M-Pesa Ratiba (Standing Orders)**
Create M-Pesa standing orders for recurring payments.

**Endpoint:** `POST /standingorder/v1/createStandingOrderExternal`

**Use Case:** Subscriptions, recurring bills, automated payments

[View Documentation](./documentation/MpesaRatiba/MpesaRatiba.md)

---

### 16. **Pull Transaction**
Query all C2B transactions performed under your shortcode for reconciliation.

**Endpoint:** `POST /pulltransactions/v1/register`

**Use Case:** Transaction reconciliation, reporting

[View Documentation](./documentation/PullTransaction/PullTransaction.md)

---

### 17. **Reversals**
Reverse an M-Pesa transaction.

**Endpoint:** `POST /mpesa/reversal/v1/request`

**Use Case:** Refunds, error corrections

[View Documentation](./documentation/reversals/reversals.md)

---

### 18. **SIM Swap**
Query the last date a SIM card was swapped.

**Endpoint:** `POST /imsi/v2/checkATI`

**Use Case:** Fraud detection, security verification

[View Documentation](./documentation/Swap/Swap.md)

---

### 19. **Tax Remittance**
Remit tax payments to Kenya Revenue Authority (KRA).

**Endpoint:** `POST /mpesa/b2b/v1/remittax`

**Use Case:** Tax compliance, automated tax payments

[View Documentation](./documentation/TaxRemittance/TaxRemittance.md)

---

### 20. **Transaction Status**
Check the status of a transaction.

**Use Case:** Track payment status, debugging

[View Documentation](./documentation/transaction-status/transaction-status.md)

---

## Testing

### Using the Sandbox

All endpoints can be tested using Safaricom's sandbox environment:

```
Base URL: https://sandbox.safaricom.co.ke
```

Test credentials are available in the [Daraja Portal](https://developer.safaricom.co.ke/).

### Localhost Testing

For callback URLs, use tunneling tools:
- [Ngrok](https://ngrok.com/)
- [LocalTunnel](https://localtunnel.github.io/www/)

## Going Live

To use production endpoints:

1. Ensure you have an M-Pesa account (PayBill, Till Number, or B2C)
2. Access the [M-Pesa Portal](https://org.ke.m-pesa.com/)
3. Create an Admin or Business Manager
4. Whitelist your callback URLs
5. Update base URL to production: `https://api.safaricom.co.ke`

### IP Whitelisting

Whitelist these IPs to receive callbacks:
```
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

## Documentation

- [Getting Started Guide](./documentation/1.getting_started.md)
- [Authorization](./documentation/2.authorization.md)
- [Dynamic QR](./documentation/3.dynamic_qr.md)
- [All API Documentation](./documentation/)

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is for educational purposes. Please refer to Safaricom's terms of service for API usage.

## Useful Links

- [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
- [Daraja API Documentation](https://developer.safaricom.co.ke/Documentation)
- [M-Pesa Portal](https://org.ke.m-pesa.com/)

## Support

For API-related issues, contact Safaricom support at m-pesabusiness@safaricom.co.ke

## Disclaimer
This is a sample implementation for educational purposes. Always follow security best practices and never expose your API credentials in production code.
