# Quick Start Guide: API Documentation

## 🎯 In 3 Simple Steps

### Step 1: Start Server
```bash
cd backend
python manage.py runserver
```

### Step 2: Open Browser
Go to: **http://localhost:8000/api/docs/**

### Step 3: Test an Endpoint
1. Click "M-Pesa Payments" section
2. Click "POST /api/mpesa/stk-push/"
3. Click "Try it out"
4. Enter test data:
   ```json
   {
     "phone_number": "254712345678",
     "amount": 100,
     "account_reference": "Test123",
     "transaction_desc": "Test payment"
   }
   ```
5. Click "Execute"
6. See the response!

## 📍 Available URLs

| What | URL | Use For |
|------|-----|---------|
| **Swagger UI** | http://localhost:8000/api/docs/ | Testing endpoints interactively |
| **ReDoc** | http://localhost:8000/api/redoc/ | Reading clean documentation |
| **OpenAPI Schema** | http://localhost:8000/api/schema/ | Exporting for other tools |

## 🎨 What You'll See

### Swagger UI Features
- ✅ Try out endpoints with real data
- ✅ See request/response examples
- ✅ Filter and search endpoints
- ✅ Validate inputs automatically
- ✅ View all response codes

### Documented Endpoints
1. **Initiate STK Push** - Start a payment
2. **Query STK Push** - Check payment status
3. **Get Transaction** - Get transaction details
4. **Register C2B** - Setup C2B URLs

## 💡 Tips

### Testing STK Push
```json
{
  "phone_number": "254712345678",
  "amount": 100,
  "account_reference": "OrderXYZ",
  "transaction_desc": "Payment for order"
}
```

### Querying Status
```json
{
  "checkout_request_id": "ws_CO_191220191020363925"
}
```

### Getting Transaction
Just use the transaction ID in the URL:
```
GET /api/mpesa/transactions/PGH4M1JOK2/
```

## 🔧 Troubleshooting

**Server not starting?**
```bash
cd backend
source env/Scripts/activate  # Windows
python manage.py runserver
```

**Page not loading?**
- Check server is running on port 8000
- Try: http://127.0.0.1:8000/api/docs/

**Endpoints missing?**
- Refresh the page
- Check console for errors
- Restart the server

## 📖 Full Documentation

For detailed information, see:
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete guide
- [DRF_SPECTACULAR_SUMMARY.md](DRF_SPECTACULAR_SUMMARY.md) - Implementation details

---

**That's it! You're ready to explore your API documentation. 🚀**
