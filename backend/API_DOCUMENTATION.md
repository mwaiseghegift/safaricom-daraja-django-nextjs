# API Documentation with drf-spectacular

This project uses **drf-spectacular** to automatically generate interactive API documentation from your Django REST Framework endpoints.

## 🚀 Quick Start

### 1. Access the Documentation

Once your Django server is running, you can access the API documentation at:

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

### 2. Start the Server

```bash
cd backend
python manage.py runserver
```

Then open your browser to http://localhost:8000/api/docs/

## 📖 Documentation Features

### Swagger UI (Recommended)
- **Interactive testing**: Try out API endpoints directly from the browser
- **Request/Response examples**: See sample payloads for each endpoint
- **Schema validation**: Automatically validates request data
- **Filter & search**: Easily find specific endpoints

Access at: http://localhost:8000/api/docs/

### ReDoc
- **Clean, professional layout**: Better for sharing with clients
- **Responsive design**: Works great on mobile devices
- **Download OpenAPI spec**: Export the API schema
- **No testing features**: Read-only documentation

Access at: http://localhost:8000/api/redoc/

## 📋 Available Endpoints

### M-Pesa Payments
- `POST /api/mpesa/stk-push/` - Initiate STK Push payment
- `POST /api/mpesa/stk-push/query/` - Query STK Push status

### M-Pesa Transactions
- `GET /api/mpesa/transactions/{transaction_id}/` - Get transaction status

### M-Pesa Configuration
- `POST /api/mpesa/c2b/register/` - Register C2B URLs

### Callbacks (Internal - Called by Safaricom)
- `POST /api/mpesa/stk-push/callback/`
- `POST /api/mpesa/b2c/callback/`
- `POST /api/mpesa/b2b/callback/`
- `POST /api/mpesa/c2b/validation/`
- `POST /api/mpesa/c2b/confirmation/`
- `POST /api/mpesa/reversal/callback/`
- `POST /api/mpesa/transaction-status/callback/`
- `POST /api/mpesa/account-balance/callback/`

## 🔧 Generating OpenAPI Schema

To generate the OpenAPI schema file:

```bash
python manage.py spectacular --file schema.yml
```

This creates a `schema.yml` file that you can:
- Import into API testing tools (Postman, Insomnia, Bruno)
- Share with frontend developers
- Use for API contract testing
- Generate client SDKs

## 🎯 Using the Interactive Docs

### Testing an Endpoint

1. Navigate to http://localhost:8000/api/docs/
2. Find the endpoint you want to test (e.g., "Initiate STK Push Payment")
3. Click the endpoint to expand it
4. Click **"Try it out"**
5. Fill in the request body:
   ```json
   {
     "phone_number": "254712345678",
     "amount": 100,
     "account_reference": "TestOrder123",
     "transaction_desc": "Payment for test order"
   }
   ```
6. Click **"Execute"**
7. View the response below

### Understanding Responses

Each endpoint shows:
- **200**: Success response with example data
- **400**: Bad request (missing/invalid parameters)
- **404**: Not found (for GET endpoints)
- **500**: Server error

## 📚 Implementation Details

### Serializers
All API documentation is driven by serializers in `mpesa/serializers.py`:
- `STKPushRequestSerializer` - Request body for STK Push
- `STKPushResponseSerializer` - Response for successful STK Push
- `STKPushQueryRequestSerializer` - Request for query endpoint
- `STKPushQueryResponseSerializer` - Response for query
- `TransactionSerializer` - Transaction status response
- `C2BRegisterResponseSerializer` - C2B registration response
- `ErrorResponseSerializer` - Error responses

### View Decorators
Views use `@extend_schema` decorator for documentation:
```python
@extend_schema(
    summary="Initiate STK Push Payment",
    description="Sends payment prompt to customer's phone",
    tags=["M-Pesa Payments"],
    request=STKPushRequestSerializer,
    responses={
        200: STKPushResponseSerializer,
        400: ErrorResponseSerializer,
    }
)
@api_view(['POST'])
def initiate_stk_push(request):
    ...
```

### Configuration
Settings are in `config/settings.py`:
- `REST_FRAMEWORK['DEFAULT_SCHEMA_CLASS']` - AutoSchema
- `SPECTACULAR_SETTINGS` - Full configuration
- `INSTALLED_APPS` - Includes 'drf_spectacular'

URL routes in `config/urls.py`:
- `/api/schema/` - OpenAPI schema
- `/api/docs/` - Swagger UI
- `/api/redoc/` - ReDoc

## 🛠️ Customization

### Adding New Endpoints

1. Create serializers in `mpesa/serializers.py`
2. Add `@extend_schema` decorator to view
3. Documentation updates automatically!

Example:
```python
from drf_spectacular.utils import extend_schema

@extend_schema(
    summary="My New Endpoint",
    description="Does something awesome",
    tags=["M-Pesa Payments"],
    request=MyRequestSerializer,
    responses={200: MyResponseSerializer}
)
@api_view(['POST'])
def my_endpoint(request):
    pass
```

### Updating Settings

Edit `SPECTACULAR_SETTINGS` in `config/settings.py` to customize:
- Title, description, version
- Contact information
- Authentication schemes
- Tag groups
- UI settings

## 📦 Dependencies

```
Django>=6.0
djangorestframework>=3.15.2
drf-spectacular>=0.27.0
```

## 🌐 Production Deployment

For production:

1. **Set proper permissions**:
   ```python
   'SERVE_PERMISSIONS': ['rest_framework.permissions.IsAuthenticated']
   ```

2. **Update contact info** in `SPECTACULAR_SETTINGS`

3. **Add authentication** to documentation:
   ```python
   'SECURITY': [{'Bearer': []}],
   'APPEND_COMPONENTS': {
       'securitySchemes': {
           'Bearer': {
               'type': 'http',
               'scheme': 'bearer',
           }
       }
   }
   ```

## 🐛 Troubleshooting

### Documentation not showing up?
- Check `drf_spectacular` is in `INSTALLED_APPS`
- Verify `DEFAULT_SCHEMA_CLASS` is set
- Restart Django server

### Endpoints missing?
- Ensure views have `@extend_schema` decorator
- Check URL patterns are correct
- Verify `SCHEMA_PATH_PREFIX` matches your API structure

### Schema validation errors?
- Check serializers have proper field types
- Ensure all required fields are documented
- Validate with `python manage.py spectacular --validate`

## 📖 Additional Resources

- [drf-spectacular Documentation](https://drf-spectacular.readthedocs.io/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Safaricom Daraja API Docs](https://developer.safaricom.co.ke/)

## 🎓 Best Practices

1. **Always document**:
   - Add `@extend_schema` to all API views
   - Write clear descriptions
   - Provide examples

2. **Keep serializers updated**:
   - Match actual request/response structure
   - Add helpful `help_text` to fields
   - Use proper field types

3. **Tag consistently**:
   - Group related endpoints
   - Use predefined tags from settings
   - Keep tag names user-friendly

4. **Test regularly**:
   - Use Swagger UI to test endpoints
   - Verify examples are accurate
   - Check all response codes

5. **Version your API**:
   - Update VERSION in settings
   - Document breaking changes
   - Consider versioned URLs

---

**Happy documenting! 🎉**

For questions or issues, refer to the main [README.md](README.md) or contact the development team.
