# M-Pesa Daraja API - Django Backend

Production-ready Django backend for consuming Safaricom Daraja APIs (M-Pesa payments).

## Features

✅ **Complete API Coverage**
- STK Push (Lipa Na M-Pesa Online)
- B2C (Business to Customer) Payments
- B2B (Business to Business) Payments
- C2B (Customer to Business) Payments
- Transaction Reversals
- Transaction Status Queries
- Account Balance Queries

✅ **Production Ready**
- OAuth 2.0 token management with caching
- Comprehensive error handling
- Request/response logging
- Database transaction tracking
- Callback handling
- Security best practices

✅ **Developer Friendly**
- Service layer architecture
- Django REST Framework API
- Admin interface
- Management commands
- Detailed documentation

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.sample .env
# Edit .env with your Safaricom credentials
```

### 3. Run Migrations

```bash
python manage.py migrate
```

### 4. Create Admin User

```bash
python manage.py createsuperuser
```

### 5. Test Connection

```bash
python manage.py test_daraja
```

### 6. Run Server

```bash
python manage.py runserver
```

Visit:
- API: `http://localhost:8000/api/mpesa/`
- Admin: `http://localhost:8000/admin/`

## Project Structure

```
backend/
├── config/                 # Django project settings
│   ├── settings.py        # Main settings with Daraja config
│   ├── urls.py           # URL routing
│   └── wsgi.py
│
├── mpesa/                 # Main M-Pesa app
│   ├── models.py         # Database models
│   ├── client.py         # Daraja API client (OAuth, HTTP)
│   ├── services.py       # Service layer (business logic)
│   ├── views.py          # API views & callback handlers
│   ├── urls.py           # URL patterns
│   ├── admin.py          # Django admin config
│   └── management/       # Management commands
│       └── commands/
│           └── test_daraja.py
│
├── logs/                  # Application logs
├── certificates/          # Safaricom certificates
├── .env                   # Environment variables (not in git)
├── .env.sample           # Environment template
├── requirements.txt      # Python dependencies
├── USAGE.md             # Detailed usage guide
└── README.md            # This file
```

## Architecture

### Service Layer Pattern

```python
# Client Layer - OAuth & HTTP Communication
DarajaClient → OAuth Token → HTTP Requests → Logging

# Service Layer - Business Logic
DarajaService → Transaction Creation → API Calls

# Views Layer - API Endpoints & Callbacks
Views → Service Methods → JSON Response
Callbacks → Transaction Updates → Database
```

### Database Models

1. **Transaction** - Base model for all transactions
2. **STKPushTransaction** - STK Push specific data
3. **B2CTransaction** - B2C payment data
4. **C2BTransaction** - C2B payment data
5. **ReversalTransaction** - Reversal data
6. **CallbackLog** - All callbacks from Safaricom
7. **APIRequestLog** - All API requests to Safaricom

## API Endpoints

### For Frontend Consumption

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mpesa/stk-push/` | Initiate STK Push |
| POST | `/api/mpesa/stk-push/query/` | Query STK Push status |
| GET | `/api/mpesa/transactions/{id}/` | Get transaction status |
| POST | `/api/mpesa/c2b/register/` | Register C2B URLs |

### Callback Endpoints (Safaricom calls these)

| Endpoint | Description |
|----------|-------------|
| `/api/mpesa/callback/stk/` | STK Push result |
| `/api/mpesa/callback/b2c/` | B2C result |
| `/api/mpesa/callback/b2b/` | B2B result |
| `/api/mpesa/callback/c2b/validation/` | C2B validation |
| `/api/mpesa/callback/c2b/confirmation/` | C2B confirmation |
| `/api/mpesa/callback/reversal/` | Reversal result |
| `/api/mpesa/callback/transaction-status/` | Status query result |
| `/api/mpesa/callback/account-balance/` | Balance query result |

## Usage Examples

### Python Service Layer

```python
from mpesa.services import DarajaService

service = DarajaService()

# STK Push
response = service.stk_push(
    phone_number='254712345678',
    amount=100,
    account_reference='OrderXYZ',
    transaction_desc='Payment'
)

# B2C Payment
response = service.b2c_payment(
    phone_number='254712345678',
    amount=500,
    command_id='SalaryPayment',
    remarks='Salary for January'
)

# Reversal
response = service.reverse_transaction(
    transaction_id='NEI7OUQX4R',
    amount=100,
    receiver_party='600000',
    remarks='Wrong transaction'
)
```

### HTTP API (cURL)

```bash
# Initiate STK Push
curl -X POST http://localhost:8000/api/mpesa/stk-push/ \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "254712345678",
    "amount": 100,
    "account_reference": "OrderXYZ",
    "transaction_desc": "Payment"
  }'

# Get Transaction Status
curl http://localhost:8000/api/mpesa/transactions/NEI7OUQX4R/
```

## Configuration

### Environment Variables

Key variables in `.env`:

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Daraja API
DARAJA_CONSUMER_KEY=your_key
DARAJA_CONSUMER_SECRET=your_secret
DARAJA_PASSKEY=your_passkey
DARAJA_SHORTCODE=174379
DARAJA_ENVIRONMENT=sandbox  # or production

# Callbacks
DARAJA_CALLBACK_BASE_URL=https://yourdomain.com
```

### Settings.py Configuration

All Daraja settings are in `DARAJA` dict:

```python
DARAJA = {
    'CONSUMER_KEY': env('DARAJA_CONSUMER_KEY'),
    'CONSUMER_SECRET': env('DARAJA_CONSUMER_SECRET'),
    'ENVIRONMENT': env('DARAJA_ENVIRONMENT', 'sandbox'),
    'SHORTCODE': env('DARAJA_SHORTCODE'),
    'PASSKEY': env('DARAJA_PASSKEY'),
    # ... more settings
}
```

## Testing

### Test Credentials (Sandbox)

```env
DARAJA_CONSUMER_KEY=test_key
DARAJA_CONSUMER_SECRET=test_secret
DARAJA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
DARAJA_SHORTCODE=174379
DARAJA_ENVIRONMENT=sandbox
```

### Test Phone Numbers

- `254708374149`
- `254724353759`

### Run Tests

```bash
# Test API connection
python manage.py test_daraja

# Django tests (if you create them)
python manage.py test mpesa
```

## Deployment

### Production Checklist

- [ ] Set `DEBUG=False`
- [ ] Use production credentials
- [ ] Configure HTTPS
- [ ] Set up proper database (PostgreSQL/MySQL)
- [ ] Configure static files
- [ ] Set up logging
- [ ] Enable security middleware
- [ ] Configure CORS properly
- [ ] Set strong SECRET_KEY
- [ ] Use gunicorn/uwsgi
- [ ] Set up monitoring

### Deployment Example (gunicorn)

```bash
pip install gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

## Monitoring & Debugging

### Logs

```bash
# View logs
tail -f logs/django.log

# Or in settings.py
LOGGING = {
    'handlers': {
        'file': {
            'filename': 'logs/django.log',
        }
    }
}
```

### Admin Interface

Monitor transactions:
- `http://localhost:8000/admin/mpesa/transaction/`
- `http://localhost:8000/admin/mpesa/callbacklog/`
- `http://localhost:8000/admin/mpesa/apirequestlog/`

## Dependencies

```
Django==6.0
djangorestframework==3.15.2
django-cors-headers==4.6.0
python-dotenv==1.0.1
requests==2.32.3
cryptography==44.0.0
```

## Security Features

- OAuth 2.0 token management
- Token caching (reduces API calls)
- Password encryption using Safaricom certificate
- CSRF protection on callbacks
- Request/response sanitization in logs
- CORS configuration
- HTTPS enforcement (production)

## Support & Resources

- **Documentation**: See [USAGE.md](USAGE.md) for detailed guide
- **Safaricom Docs**: [developer.safaricom.co.ke](https://developer.safaricom.co.ke/docs)
- **Django Docs**: [docs.djangoproject.com](https://docs.djangoproject.com/)

## License

MIT License - see LICENSE file

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**Made with ❤️ for developers building M-Pesa integrations**
