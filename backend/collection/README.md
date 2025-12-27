# Safaricom Daraja Django API - Bruno Collection

This Bruno collection contains all the API endpoints for the Safaricom Daraja Django backend.

## Setup

1. **Install Bruno**: Download from [usebruno.com](https://www.usebruno.com/)

2. **Open Collection**: 
   - Launch Bruno
   - Click "Open Collection"
   - Navigate to: `backend/collection/`

3. **Select Environment**:
   - Choose "Local" for development (localhost:8000)
   - Choose "Production" for deployed backend

## Collection Structure

### 📁 STK Push
- **Initiate STK Push**: Send payment request to customer's phone
- **Query STK Push Status**: Check status of pending STK Push

### 📁 Transactions
- **Get Transaction Status**: Retrieve transaction details from database

### 📁 C2B
- **Register C2B URLs**: Register validation & confirmation URLs (one-time setup)

### 📁 Callbacks
These endpoints are called by Safaricom servers (not your frontend):
- **STK Push Callback**: Receives STK Push payment results
- **B2C Callback**: Business to Customer payment results
- **B2B Callback**: Business to Business payment results
- **C2B Validation**: Validates incoming C2B payment (before processing)
- **C2B Confirmation**: Confirms successful C2B payment (after processing)
- **Reversal Callback**: Transaction reversal results
- **Transaction Status Callback**: Transaction status query results
- **Account Balance Callback**: Account balance query results

## Environment Variables

### Local Environment
```
base_url: http://localhost:8000
api_base: {{base_url}}/api/mpesa
```

### Production Environment
```
base_url: https://your-production-domain.com
api_base: {{base_url}}/api/mpesa
```

## Testing Callbacks Locally

To test callback endpoints on your local machine:

1. **Use ngrok or similar tunnel**:
   ```bash
   ngrok http 8000
   ```

2. **Update .env with ngrok URL**:
   ```env
   DARAJA_CALLBACK_BASE_URL=https://your-ngrok-url.ngrok.io
   ```

3. **Restart Django server** to apply new callback URLs

4. **Test callbacks** using the provided sample payloads in Bruno

## API Authentication

Currently, endpoints use `AllowAny` permission for testing. 

**Production**: Update views to use proper authentication:
```python
@permission_classes([IsAuthenticated])
```

## Common Result Codes

### STK Push
- `0`: Success
- `1032`: Cancelled by user
- `1`: Insufficient funds
- `2001`: Wrong PIN entered
- `1037`: Timeout - user didn't enter PIN

### B2C/B2B/Reversals
- `0`: Success
- Other codes: Check Safaricom documentation for specific error meanings

## Support

For API documentation, visit:
- [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
- [Backend README](../README.md)
- [Usage Guide](../USAGE.md)

## Tips

1. **Start Django Server**: Make sure backend is running
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Check Logs**: Monitor Django logs for callback processing
   ```bash
   tail -f logs/mpesa.log
   ```

3. **Database**: View transactions in Django admin or database directly

4. **Transaction IDs**: Save `checkout_request_id` from STK Push to query status later
