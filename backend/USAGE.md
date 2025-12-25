# M-Pesa Daraja API - Usage Guide

This guide explains how to use the Django backend for consuming Safaricom Daraja APIs.

## Table of Contents

1. [Setup](#setup)
2. [Configuration](#configuration)
3. [Running the Server](#running-the-server)
4. [API Endpoints](#api-endpoints)
5. [Service Methods](#service-methods)
6. [Callback Handling](#callback-handling)
7. [Admin Interface](#admin-interface)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

---

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.sample` to `.env` and fill in your Safaricom credentials:

```bash
cp .env.sample .env
```

Edit `.env` with your actual credentials:

```env
# Daraja API Credentials (from Safaricom Developer Portal)
DARAJA_CONSUMER_KEY=your_consumer_key_here
DARAJA_CONSUMER_SECRET=your_consumer_secret_here
DARAJA_PASSKEY=your_passkey_here

# Business Details
DARAJA_SHORTCODE=174379  # Your business shortcode
DARAJA_TILL_NUMBER=174379
DARAJA_PAYBILL=174379

# Initiator Credentials
DARAJA_INITIATOR_NAME=testapi
DARAJA_INITIATOR_PASSWORD=Safaricom123!

# Environment (sandbox or production)
DARAJA_ENVIRONMENT=sandbox

# Callback URLs (your public URL)
DARAJA_CALLBACK_BASE_URL=https://yourdomain.com
```

### 3. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 4. Create Superuser (for admin access)

```bash
python manage.py createsuperuser
```

---

## Configuration

### Safaricom Certificates

For **Production**, download the Safaricom certificate:

1. Visit [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Download the production certificate
3. Save as `backend/certificates/prod.cer`

### Callback URLs

For callbacks to work, your application must be:
- **Publicly accessible** (use ngrok for local testing)
- **HTTPS enabled** (Safaricom requires HTTPS)

Example with ngrok:
```bash
ngrok http 8000
```

Then update `.env`:
```env
DARAJA_CALLBACK_BASE_URL=https://your-ngrok-url.ngrok.io
```

---

## Running the Server

### Development Server

```bash
python manage.py runserver
```

Server runs at: `http://localhost:8000`

### Production Server

Use gunicorn or similar:

```bash
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000
```

---

## API Endpoints

### Base URL: `/api/mpesa/`

### 1. STK Push (Lipa Na M-Pesa Online)

**Initiate Payment**

```http
POST /api/mpesa/stk-push/
Content-Type: application/json

{
    "phone_number": "254712345678",
    "amount": 100,
    "account_reference": "OrderXYZ123",
    "transaction_desc": "Payment for Order XYZ"
}
```

**Response:**
```json
{
    "MerchantRequestID": "29115-34620561-1",
    "CheckoutRequestID": "ws_CO_191220191020363925",
    "ResponseCode": "0",
    "ResponseDescription": "Success. Request accepted for processing",
    "CustomerMessage": "Success. Request accepted for processing"
}
```

**Query STK Push Status**

```http
POST /api/mpesa/stk-push/query/
Content-Type: application/json

{
    "checkout_request_id": "ws_CO_191220191020363925"
}
```

### 2. Get Transaction Status

```http
GET /api/mpesa/transactions/{transaction_id}/
```

**Response:**
```json
{
    "transaction_id": "NEI7OUQX4R",
    "transaction_type": "STK_PUSH",
    "status": "SUCCESS",
    "amount": "100.00",
    "phone_number": "254712345678",
    "account_reference": "OrderXYZ123",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:45Z"
}
```

### 3. Register C2B URLs

```http
POST /api/mpesa/c2b/register/
```

This should be called once during setup to register your C2B callback URLs with Safaricom.

---

## Service Methods

Use service methods in your Django views or management commands:

### Import the Service

```python
from mpesa.services import DarajaService

service = DarajaService()
```

### STK Push

```python
# Initiate STK Push
response = service.stk_push(
    phone_number='254712345678',
    amount=100,
    account_reference='OrderXYZ',
    transaction_desc='Payment for Order XYZ'
)

# Query STK Push
status = service.stk_push_query(
    checkout_request_id='ws_CO_191220191020363925'
)
```

### B2C Payment

```python
response = service.b2c_payment(
    phone_number='254712345678',
    amount=500,
    command_id='SalaryPayment',  # or 'BusinessPayment', 'PromotionPayment'
    remarks='Salary for January',
    occasion='Monthly Salary'
)
```

### B2B Payment

```python
response = service.b2b_payment(
    receiver_shortcode='600000',
    amount=1000,
    command_id='BusinessPayBill',  # or 'BusinessBuyGoods'
    account_reference='ACC123',
    remarks='Payment to supplier'
)
```

### Transaction Reversal

```python
response = service.reverse_transaction(
    transaction_id='NEI7OUQX4R',
    amount=100,
    receiver_party='600000',
    remarks='Wrong transaction',
    occasion='Error reversal'
)
```

### Transaction Status Query

```python
response = service.transaction_status(
    transaction_id='NEI7OUQX4R',
    remarks='Status check'
)
```

### Account Balance

```python
response = service.account_balance(
    remarks='Balance inquiry'
)
```

### Register C2B URLs

```python
response = service.register_c2b_urls(
    shortcode='174379',  # optional, defaults to config
    response_type='Completed'  # or 'Cancelled'
)
```

---

## Callback Handling

Safaricom sends callbacks to notify you of transaction results.

### Callback URLs

All callbacks are under `/api/mpesa/callback/`:

| Callback | URL | Description |
|----------|-----|-------------|
| STK Push | `/api/mpesa/callback/stk/` | Payment completion/cancellation |
| B2C | `/api/mpesa/callback/b2c/` | B2C payment result |
| B2B | `/api/mpesa/callback/b2b/` | B2B payment result |
| C2B Validation | `/api/mpesa/callback/c2b/validation/` | Validate C2B before processing |
| C2B Confirmation | `/api/mpesa/callback/c2b/confirmation/` | C2B payment confirmation |
| Reversal | `/api/mpesa/callback/reversal/` | Reversal result |
| Transaction Status | `/api/mpesa/callback/transaction-status/` | Status query result |
| Account Balance | `/api/mpesa/callback/account-balance/` | Balance query result |

### How Callbacks Work

1. **Safaricom calls your callback URL** with transaction result
2. **Backend logs the callback** in `CallbackLog` model
3. **Transaction status is updated** in database
4. **Frontend can poll** or use websockets to get updates

### Example: STK Push Callback

When a customer completes STK Push payment:

1. Safaricom sends POST request to `/api/mpesa/callback/stk/`
2. Backend updates transaction status to `SUCCESS` or `FAILED`
3. M-Pesa receipt number is saved

### Monitoring Callbacks

Check callback logs in Django admin:
```
http://localhost:8000/admin/mpesa/callbacklog/
```

---

## Admin Interface

Access Django admin at: `http://localhost:8000/admin/`

### Available Admin Pages

1. **Transactions** - All transactions (STK Push, B2C, B2B, C2B, Reversals)
2. **STK Push Transactions** - STK Push specific details
3. **B2C Transactions** - Business to Customer payments
4. **C2B Transactions** - Customer to Business payments
5. **Reversal Transactions** - Transaction reversals
6. **Callback Logs** - All callbacks received from Safaricom
7. **API Request Logs** - All API calls made to Safaricom

### Useful Filters

- Filter by transaction type
- Filter by status (PENDING/SUCCESS/FAILED)
- Filter by date range
- Search by phone number, transaction ID, etc.

---

## Testing

### 1. Test Credentials

Safaricom provides test credentials:

```env
DARAJA_CONSUMER_KEY=test_key
DARAJA_CONSUMER_SECRET=test_secret
DARAJA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
DARAJA_SHORTCODE=174379
DARAJA_ENVIRONMENT=sandbox
```

### 2. Test Phone Numbers

Use Safaricom test numbers:
- `254708374149`
- `254724353759`

### 3. Test STK Push

```bash
curl -X POST http://localhost:8000/api/mpesa/stk-push/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "254708374149",
    "amount": 10,
    "account_reference": "TEST001",
    "transaction_desc": "Test Payment"
  }'
```

### 4. Check Logs

View logs in:
- Terminal output
- `backend/logs/django.log`
- Django admin

---

## Troubleshooting

### Issue: "Invalid Access Token"

**Cause:** Token expired or invalid credentials

**Solution:**
1. Verify `DARAJA_CONSUMER_KEY` and `DARAJA_CONSUMER_SECRET`
2. Check environment (sandbox vs production)
3. Token caches for 3500 seconds - wait or clear cache

### Issue: "Bad Request - Invalid Shortcode"

**Cause:** Wrong business shortcode

**Solution:**
1. Verify `DARAJA_SHORTCODE` matches your Safaricom account
2. For sandbox, use `174379`
3. For production, use your actual shortcode

### Issue: "Callback Not Received"

**Cause:** Callback URL not reachable or not HTTPS

**Solution:**
1. Ensure your server is publicly accessible
2. Use ngrok for local testing
3. Verify callback URL in `.env` is correct
4. Check Safaricom firewall/IP whitelisting

### Issue: "Request Timeout"

**Cause:** Safaricom API slow or unavailable

**Solution:**
1. Check Safaricom API status
2. Increase `DARAJA_TIMEOUT` in `.env`
3. Retry the request

### Issue: "Insufficient Permissions"

**Cause:** Missing API permissions on Safaricom portal

**Solution:**
1. Login to [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Ensure your app has necessary API permissions
3. Regenerate credentials if needed

### Debug Mode

Enable debug logging in `.env`:

```env
DEBUG=True
```

View detailed logs:
```bash
tail -f backend/logs/django.log
```

---

## Production Checklist

Before deploying to production:

- [ ] Set `DEBUG=False` in settings
- [ ] Update `ALLOWED_HOSTS` with your domain
- [ ] Use production Safaricom credentials
- [ ] Download production certificate
- [ ] Set up HTTPS (SSL/TLS)
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Enable security middleware
- [ ] Set strong `SECRET_KEY`
- [ ] Configure production logging
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Test all callback URLs
- [ ] Register C2B URLs with production shortcode

---

## Support

For issues with:
- **Daraja API**: [Safaricom Support](https://developer.safaricom.co.ke/support)
- **This Backend**: Check GitHub issues or create a new one

---

## Additional Resources

- [Safaricom Daraja Documentation](https://developer.safaricom.co.ke/docs)
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
