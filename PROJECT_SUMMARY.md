# Safaricom Daraja Django-Next.js Implementation

## Project Summary

Complete, production-ready implementation of Safaricom Daraja API integration using Django backend and Next.js frontend.

## What Has Been Implemented

### ✅ Django Backend (Complete)

#### Core Infrastructure
- **DarajaClient** (`mpesa/client.py`)
  - OAuth 2.0 token generation with caching
  - Password encryption using RSA with Safaricom certificate
  - Generic HTTP request handler with retry logic
  - Comprehensive error handling
  - Request/response logging and sanitization

- **DarajaService** (`mpesa/services.py`)
  - STK Push (Lipa Na M-Pesa Online)
  - STK Push Query
  - B2C Payments (3 command types)
  - B2B Payments
  - C2B URL Registration
  - Transaction Reversals
  - Transaction Status Queries
  - Account Balance Queries

#### Database Models
- **Transaction** - Base model for all transaction types
- **STKPushTransaction** - STK Push specific data
- **B2CTransaction** - B2C payment details
- **C2BTransaction** - C2B payment details
- **ReversalTransaction** - Reversal transaction data
- **CallbackLog** - All callbacks from Safaricom (audit trail)
- **APIRequestLog** - All API requests made (debugging/monitoring)

#### API Endpoints
**For Frontend:**
- `POST /api/mpesa/stk-push/` - Initiate STK Push
- `POST /api/mpesa/stk-push/query/` - Query STK Push status
- `GET /api/mpesa/transactions/{id}/` - Get transaction details
- `POST /api/mpesa/c2b/register/` - Register C2B URLs

**For Callbacks (Safaricom):**
- `POST /api/callback/stk/` - STK Push result
- `POST /api/callback/b2c/` - B2C result
- `POST /api/callback/b2b/` - B2B result
- `POST /api/callback/c2b/validation/` - C2B validation
- `POST /api/callback/c2b/confirmation/` - C2B confirmation
- `POST /api/callback/reversal/` - Reversal result
- `POST /api/callback/transaction-status/` - Status query result
- `POST /api/callback/account-balance/` - Balance query result

#### Configuration
- Environment variable management with `python-dotenv`
- Comprehensive `.env.sample` template
- Django settings with DARAJA configuration dictionary
- CORS configuration for Next.js frontend
- Logging configuration (console + file)
- REST Framework configuration

#### Admin Interface
- Transaction admin with filters and search
- STK Push transaction admin
- B2C transaction admin
- C2B transaction admin
- Reversal transaction admin
- Callback log admin
- API request log admin

#### Management Commands
- `test_daraja` - Test API connection and configuration

#### Documentation
- `README.md` - Quick start and overview
- `USAGE.md` - Comprehensive usage guide (API, testing, troubleshooting)

### 📋 Frontend (To Be Implemented)

The Next.js frontend structure exists but needs implementation of:
- Payment form components
- API integration with Django backend
- Transaction status polling
- User interface for M-Pesa operations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Frontend                         │
│  - Payment Forms                                             │
│  - Transaction Status Display                                │
│  - API Client                                                │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/REST API
┌────────────────────────┴─────────────────────────────────────┐
│                    Django Backend                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Views Layer (API Endpoints)                 ││
│  │  - REST API for frontend                                 ││
│  │  - Callback handlers for Safaricom                       ││
│  └────────────────────────┬─────────────────────────────────┘│
│  ┌────────────────────────┴─────────────────────────────────┐│
│  │          Services Layer (Business Logic)                 ││
│  │  - DarajaService: All API operations                     ││
│  │  - Transaction creation & management                     ││
│  └────────────────────────┬─────────────────────────────────┘│
│  ┌────────────────────────┴─────────────────────────────────┐│
│  │         Client Layer (API Communication)                 ││
│  │  - OAuth token management                                ││
│  │  - HTTP requests to Safaricom                            ││
│  │  - Error handling & logging                              ││
│  └────────────────────────┬─────────────────────────────────┘│
│  ┌────────────────────────┴─────────────────────────────────┐│
│  │           Database Layer (ORM Models)                    ││
│  │  - Transaction tracking                                  ││
│  │  - Callback logging                                      ││
│  │  - API request logging                                   ││
│  └──────────────────────────────────────────────────────────┘│
└────────────────────────┬─────────────────────────────────────┘
                         │ Callbacks (HTTPS)
┌────────────────────────┴─────────────────────────────────────┐
│                  Safaricom Daraja API                        │
│  - STK Push                                                  │
│  - B2C, B2B, C2B                                             │
│  - Reversals, Status Queries                                 │
└──────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
safaricom-daraja-django-nextjs/
│
├── backend/                         # Django Backend
│   ├── config/                     # Project settings
│   │   ├── settings.py            # Main settings with Daraja config
│   │   ├── urls.py                # Root URL configuration
│   │   └── wsgi.py                # WSGI entry point
│   │
│   ├── mpesa/                      # M-Pesa app
│   │   ├── migrations/            # Database migrations
│   │   ├── management/            # Custom commands
│   │   │   └── commands/
│   │   │       └── test_daraja.py
│   │   ├── models.py              # Database models (7 models)
│   │   ├── client.py              # OAuth & HTTP client
│   │   ├── services.py            # Business logic (8 API methods)
│   │   ├── views.py               # API views & callbacks
│   │   ├── urls.py                # URL routing
│   │   └── admin.py               # Django admin
│   │
│   ├── logs/                       # Application logs
│   ├── certificates/               # Safaricom certificates
│   ├── env/                        # Virtual environment
│   ├── .env                        # Environment variables (not in git)
│   ├── .env.sample                # Environment template
│   ├── requirements.txt           # Python dependencies
│   ├── manage.py                  # Django management script
│   ├── README.md                  # Backend overview
│   └── USAGE.md                   # Detailed usage guide
│
├── frontend/                       # Next.js Frontend (to be implemented)
│   ├── app/                       # Next.js app directory
│   ├── public/                    # Static assets
│   └── package.json               # Node dependencies
│
└── documentation/                  # API documentation
    ├── 1.getting_started.md
    ├── 2.authorization.md
    ├── 3.dynamic_qr.md
    ├── account-balance/
    ├── b2c/, b2b/, c2b/
    ├── mpesa-express/
    └── ... (20+ API endpoints documented)
```

## Technology Stack

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework 3.15.2** - REST API
- **django-cors-headers 4.6.0** - CORS support
- **python-dotenv 1.0.1** - Environment variables
- **requests 2.32.3** - HTTP client
- **cryptography 44.0.0** - Password encryption

### Frontend
- **Next.js** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling (configured)

### Database
- **SQLite** (development)
- **PostgreSQL/MySQL** (production ready)

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- Safaricom Developer Account
- Internet connection

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv env
source env/bin/activate  # On Windows: .\env\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.sample .env
# Edit .env with your Safaricom credentials

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Test connection
python manage.py test_daraja

# Run server
python manage.py runserver
```

Visit:
- API: http://localhost:8000/api/mpesa/
- Admin: http://localhost:8000/admin/

### Frontend Setup (When Ready)

```bash
cd frontend
npm install
npm run dev
```

## API Testing

### Test STK Push

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

### Expected Response

```json
{
  "MerchantRequestID": "29115-34620561-1",
  "CheckoutRequestID": "ws_CO_191220191020363925",
  "ResponseCode": "0",
  "ResponseDescription": "Success. Request accepted for processing",
  "CustomerMessage": "Success. Request accepted for processing"
}
```

## Key Features

### 1. Token Management
- Automatic OAuth token generation
- Token caching (3500 seconds TTL)
- Automatic refresh on expiry

### 2. Error Handling
- Comprehensive exception handling
- DarajaAPIException for API errors
- Detailed error logging
- Graceful degradation

### 3. Security
- Password encryption with RSA
- CSRF protection
- CORS configuration
- Request/response sanitization
- Environment-based secrets

### 4. Monitoring
- All callbacks logged in database
- All API requests logged
- Transaction status tracking
- Admin interface for monitoring

### 5. Callback Processing
- Automatic transaction status updates
- Callback validation
- Error handling
- Idempotent processing

## Configuration

### Sandbox Credentials

```env
DARAJA_CONSUMER_KEY=test_key
DARAJA_CONSUMER_SECRET=test_secret
DARAJA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
DARAJA_SHORTCODE=174379
DARAJA_ENVIRONMENT=sandbox
```

### Callback URLs

For development, use ngrok:

```bash
ngrok http 8000
```

Update `.env`:
```env
DARAJA_CALLBACK_BASE_URL=https://your-ngrok-url.ngrok.io
```

## Production Deployment

### Checklist
- [ ] Set DEBUG=False
- [ ] Use production credentials
- [ ] Set up HTTPS
- [ ] Configure production database
- [ ] Set strong SECRET_KEY
- [ ] Configure static files
- [ ] Set up logging
- [ ] Enable monitoring
- [ ] Configure CORS properly
- [ ] Use gunicorn/uwsgi
- [ ] Set up backups

### Example Deployment

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

## Next Steps

### Immediate
1. ✅ Test API connection: `python manage.py test_daraja`
2. ✅ Test STK Push via cURL
3. ✅ Check admin interface
4. ⏳ Implement frontend payment forms

### Short Term
1. Build Next.js payment UI
2. Implement transaction polling
3. Add user authentication
4. Create payment history page

### Long Term
1. Implement all 20+ API endpoints
2. Add webhook notifications
3. Set up monitoring (Sentry)
4. Implement rate limiting
5. Add caching layer (Redis)

## Troubleshooting

### Common Issues

**Issue: "Invalid Access Token"**
- Verify credentials in `.env`
- Check environment (sandbox/production)
- Wait for token cache to expire

**Issue: "Callback Not Received"**
- Ensure server is publicly accessible (use ngrok)
- Verify HTTPS is enabled
- Check callback URL configuration

**Issue: "Bad Request - Invalid Shortcode"**
- Use 174379 for sandbox
- Use your actual shortcode for production

### Debug Mode

```env
DEBUG=True
```

View logs:
```bash
tail -f backend/logs/django.log
```

## Resources

### Documentation
- **Backend README**: `backend/README.md`
- **Usage Guide**: `backend/USAGE.md`
- **API Docs**: `documentation/` folder

### External Links
- [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
- [Daraja API Documentation](https://developer.safaricom.co.ke/docs)
- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

For issues with:
- **Daraja API**: [Safaricom Support](https://developer.safaricom.co.ke/support)
- **This Implementation**: Create GitHub issue

## License

MIT License

---

**Status**: Backend implementation complete and production-ready ✅  
**Last Updated**: December 2024
