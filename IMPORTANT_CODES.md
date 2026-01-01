# IMPORTANT CODES - Safaricom Daraja M-Pesa API

This document contains all important API endpoints, request/response examples, error codes, callback payloads, and other key information extracted from the documentation folder.

## Table of Contents
- [API Endpoints](#api-endpoints)
- [Request/Response Examples](#requestresponse-examples)
- [Error Codes](#error-codes)
- [Callback Payloads](#callback-payloads)
- [Result Codes](#result-codes)
- [IP Addresses & Certificates](#ip-addresses--certificates)
- [Other Important Parameters](#other-important-parameters)

## API Endpoints

### Authorization
- **Sandbox**: `https://sandbox.safaricom.co.ke/oauth/v1/generate`
- **Production**: `https://api.safaricom.co.ke/oauth/v1/generate`

### C2B (Customer to Business)
- **Register URL - Sandbox**: `https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl`
- **Register URL - Production**: `https://api.safaricom.co.ke/mpesa/c2b/v1/registerurl`
- **Simulate Payment - Sandbox**: `https://sandbox.safaricom.co.ke/mpesa/c2b/v1/simulate`

### B2C (Business to Customer)
- **Sandbox**: `https://sandbox.safaricom.co.ke/mpesa/b2c/v3/paymentrequest`
- **Production**: `https://api.safaricom.co.ke/mpesa/b2c/v3/paymentrequest`

### Account Balance
- **Sandbox**: `https://sandbox.safaricom.co.ke/mpesa/accountbalance/v1/query`
- **Production**: `https://api.safaricom.co.ke/mpesa/accountbalance/v1/query`

### Transaction Status
- **Sandbox**: `https://sandbox.safaricom.co.ke/mpesa/transactionstatus/v1/query`
- **Production**: `https://api.safaricom.co.ke/mpesa/transactionstatus/v1/query`

### Dynamic QR
- **Sandbox**: `https://sandbox.safaricom.co.ke/mpesa/qrcode/v1/generate`
- **Production**: `https://api.safaricom.co.ke/mpesa/qrcode/v1/generate`

## Request/Response Examples

### Authorization Token Response
```json
{
    "access_token": "ACCESS_TOKEN_HERE",
    "expires_in": 3599
}
```

### C2B Register URL Request
```json
{
    "ShortCode": "600992",
    "ResponseType": "Completed",
    "ConfirmationURL": "https://mydomain.com/confirmation",
    "ValidationURL": "https://mydomain.com/validation"
}
```

### C2B Register URL Response
```json
{
    "OriginatorCoversationID": "19464-42108-1",
    "ResponseCode": "0",
    "ResponseDescription": "success"
}
```

### C2B Simulate Payment Request
```json
{
    "ShortCode": "600992",
    "CommandID": "CustomerPayBillOnline",
    "Amount": "100",
    "Msisdn": "254708374149",
    "BillRefNumber": "TestAPI"
}
```

### B2C Payment Request
```json
{
    "OriginatorConversationID": "600997_Test_32et3241ed8yu",
    "InitiatorName": "testapi",
    "SecurityCredential": "RC6E9WDxXR4b9X2c6z3gp0oC5Th ==",
    "CommandID": "BusinessPayment",
    "Amount": "10",
    "PartyA": "600992",
    "PartyB": "254705912645",
    "Remarks": "remarked",
    "QueueTimeOutURL": "https://mydomain.com/path",
    "ResultURL": "https://mydomain.com/path",
    "Occassion": "ChristmasPay"
}
```

### B2C Payment Response
```json
{
    "ConversationID": "AG_20240706_20106e9209f64bebd05b",
    "OriginatorConversationID": "600997_Test_32et3241ed8yu",
    "ResponseCode": "0",
    "ResponseDescription": "Accept the service request successfully."
}
```

### Account Balance Request
```json
{
    "Initiator": "testapiuser",
    "SecurityCredential": "SAFVNChNHfVtXEZMBuVo+a1Hwr+DtrUVN3zVg==",
    "CommandID": "AccountBalance",
    "PartyA": "600000",
    "IdentifierType": "4",
    "Remarks": "ok",
    "QueueTimeOutURL": "http://myservice:8080/queuetimeouturl",
    "ResultURL": "http://myservice:8080/result"
}
```

### Account Balance Response
```json
{
    "OriginatorConversationID": "515-5258779-3",
    "ConversationID": "AG_20200123_0000417fed8ed666e976",
    "ResponseCode": "0",
    "ResponseDescription": "Accept the service request successfully"
}
```

### Transaction Status Request
```json
{
    "Initiator": "testapiuser",
    "SecurityCredential": "ClONZiMYBpc65lmpJ7nvnrDmUe0WvHvA5QbOsPjEo92B6IGFwDdvdeJIFL0kgwsEKWu6SQKG4ZZUxjC",
    "Command ID": "TransactionStatusQuery",
    "Transaction ID": "NEF61H8J60",
    "OriginalConversationID": "7071-4170-a0e5-8345632bad442144258",
    "PartyA": "600782",
    "IdentifierType": "4",
    "ResultURL": "http://myservice:8080/transactionstatus/result",
    "QueueTimeOutURL": "http://myservice:8080/timeout",
    "Remarks": "OK",
    "Occasion": "OK"
}
```

### Dynamic QR Request
```json
{
    "MerchantName": "Test Supermarket",
    "RefNo": "Invoice No 001",
    "Amount": 100,
    "TrxCode": "PB",
    "CPI": "373132",
    "Size": "300"
}
```

### Dynamic QR Response
```json
{
    "ResponseCode": "00",
    "RequestID": "QRCode-12345-67890",
    "ResponseDescription": "Success. Request accepted for processing",
    "QRCode": "iVBORw0KGgoAAAANSUhEUgAA..."
}
```

## Error Codes

### Authorization Errors
- `400.008.02`: Bad Request - Invalid Access Token

### C2B Errors
- `500.003.1001`: Duplicate OriginatorConversationID
- `C2B00011`: Invalid ShortCode
- `C2B00012`: Invalid Amount
- `C2B00013`: Invalid MSISDN
- `C2B00014`: Invalid CommandID
- `C2B00015`: Invalid BillRefNumber

### B2C Errors
- `500.002.1001`: Duplicate OriginatorConversationID
- `400.002.02`: Bad Request – Invalid parameter

### Account Balance Errors
- `401.002.01`: Invalid Access Token
- `400.002.02`: Bad Request – Invalid parameter
- `404.002.01`: Resource not found
- `405.001`: Method Not Allowed
- `500.002.1001`: Duplicate OriginatorConversationID
- `500.003.1001`: Internal Server Error
- `500.003.02`: Spike Arrest Violation
- `500.003.03`: Quota Violation

## Callback Payloads

### C2B Validation Callback
```json
{
    "TransactionType": "Pay Bill",
    "TransID": "RKTQDM7W6S",
    "TransTime": "20191122063845",
    "TransAmount": "10",
    "BusinessShortCode": "600638",
    "BillRefNumber": "invoice008",
    "InvoiceNumber": "",
    "OrgAccountBalance": "49197.00",
    "ThirdPartyTransID": "",
    "MSISDN": "25470*****149",
    "FirstName": "John",
    "MiddleName": "Doe",
    "LastName": "Smith"
}
```

### C2B Confirmation Callback
```json
{
    "TransactionType": "Pay Bill",
    "TransID": "RKTQDM7W6S",
    "TransTime": "20191122063845",
    "TransAmount": "10",
    "BusinessShortCode": "600638",
    "BillRefNumber": "invoice008",
    "InvoiceNumber": "",
    "OrgAccountBalance": "49197.00",
    "ThirdPartyTransID": "",
    "MSISDN": "25470*****149",
    "FirstName": "John",
    "MiddleName": "Doe",
    "LastName": "Smith"
}
```

### B2C Successful Callback
```json
{
    "Result": {
        "ResultType": 0,
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "OriginatorConversationID": "53e3-4aa8-9fe0-8fb5e4092cdd3533373",
        "ConversationID": "AG_20240706_2010364430d9bbdaf872",
        "TransactionID": "SG632NMUAB",
        "ResultParameters": {
            "ResultParameter": [
                {
                    "Key": "TransactionAmount",
                    "Value": 10
                },
                {
                    "Key": "TransactionReceipt",
                    "Value": "SG632NMUAB"
                },
                {
                    "Key": "ReceiverPartyPublicName",
                    "Value": "254705912645 - NICHOLAS JOHN SONGOK"
                },
                {
                    "Key": "TransactionCompletedDateTime",
                    "Value": "06.07.2024 22:48:52"
                },
                {
                    "Key": "B2CUtilityAccountAvailableFunds",
                    "Value": 8959269.60
                },
                {
                    "Key": "B2CWorkingAccountAvailableFunds",
                    "Value": 1199371.00
                },
                {
                    "Key": "B2CRecipientIsRegisteredCustomer",
                    "Value": "Y"
                },
                {
                    "Key": "B2CChargesPaidAccountAvailableFunds",
                    "Value": -1980.00
                }
            ]
        },
        "ReferenceData": {
            "ReferenceItem": {
                "Key": "QueueTimeoutURL",
                "Value": "https://internalsandbox.safaricom.co.ke/mpesa/b2cresults/v1/submit"
            }
        }
    }
}
```

### Account Balance Callback
```json
{
    "Result": {
        "ResultType": "0",
        "ResultCode": "0",
        "ResultDesc": "The service request is processed successfully",
        "OriginatorConversationID": "16917-22577599-3",
        "ConversationID": "AG_20200206_00005e091a8ec6b9eac5",
        "TransactionID": "OA90000000",
        "ResultParameters": {
            "ResultParameter": [
                {
                    "Key": "AccountBalance",
                    "Value": "Working Account|KES|700000.00|700000.00|0.00|0.00&Float Account|KES|0.00|0.00|0.00|0.00&Utility Account|KES|228037.00|228037.00|0.00|0.00&Charges Paid Account|KES|-1540.00|-1540.00|0.00|0.00&Organization Settlement Account|KES|0.00|0.00|0.00|0.00"
                },
                {
                    "Key": "BOCompletedTime",
                    "Value": "20200109125710"
                }
            ]
        },
        "ReferenceData": {
            "ReferenceItem": {
                "Key": "QueueTimeoutURL",
                "Value": "https://internalsandbox.safaricom.co.ke/mpesa/abresults/v1/submit"
            }
        }
    }
}
```

## Result Codes

### B2C Result Codes
- `0`: The service request is processed successfully
- `1`: The balance is insufficient for the transaction
- `2`: Declined due to limit rule
- `3`: Declined due to limit rule: greater than the maximum transaction amount
- `4`: Declined due to limit rule: would exceed daily transfer limit
- `8`: Declined due to limit rule: would exceed the maximum balance
- `11`: The DebitParty is in an invalid state
- `21`: The initiator is not allowed to initiate this request
- `2001`: The initiator information is invalid
- `2006`: Declined due to account rule: The account status does not allow this transaction
- `2028`: The request is not permitted according to product assignment
- `2040`: Credit Party customer type can't be supported by the service
- `8006`: The security credential is locked
- `SFC_IC0003`: The operator does not exist

## IP Addresses & Certificates

### Safaricom IP Addresses for Whitelisting
- `196.201.214.200`
- `196.201.214.136`
- `196.201.214.137`
- `196.201.214.138`
- `196.201.214.139`
- `196.201.214.140`
- `196.201.214.141`
- `196.201.214.142`
- `196.201.214.143`
- `196.201.214.144`
- `196.201.214.145`
- `196.201.214.146`
- `196.201.214.147`
- `196.201.214.148`
- `196.201.214.149`
- `196.201.214.150`
- `196.201.214.151`
- `196.201.214.152`
- `196.201.214.153`
- `196.201.214.154`
- `196.201.214.155`
- `196.201.214.156`
- `196.201.214.157`
- `196.201.214.158`
- `196.201.214.159`
- `196.201.214.160`
- `196.201.214.161`
- `196.201.214.162`
- `196.201.214.163`
- `196.201.214.164`
- `196.201.214.165`
- `196.201.214.166`
- `196.201.214.167`
- `196.201.214.168`
- `196.201.214.169`
- `196.201.214.170`
- `196.201.214.171`
- `196.201.214.172`
- `196.201.214.173`
- `196.201.214.174`
- `196.201.214.175`
- `196.201.214.176`
- `196.201.214.177`
- `196.201.214.178`
- `196.201.214.179`
- `196.201.214.180`
- `196.201.214.181`
- `196.201.214.182`
- `196.201.214.183`
- `196.201.214.184`
- `196.201.214.185`
- `196.201.214.186`
- `196.201.214.187`
- `196.201.214.188`
- `196.201.214.189`
- `196.201.214.190`
- `196.201.214.191`
- `196.201.214.192`
- `196.201.214.193`
- `196.201.214.194`
- `196.201.214.195`
- `196.201.214.196`
- `196.201.214.197`
- `196.201.214.198`
- `196.201.214.199`

### Certificates
- Public Key Certificate: Required for encrypting API user passwords
- Available for both Sandbox and Production environments
- Provided on the Daraja Developer Portal

## Other Important Parameters

### Command IDs
- `CustomerPayBillOnline`: C2B payment
- `CustomerBuyGoodsOnline`: C2B buy goods
- `BusinessPayment`: B2C business payment
- `SalaryPayment`: B2C salary payment
- `PromotionPayment`: B2C promotional payment
- `AccountBalance`: Account balance query
- `TransactionStatusQuery`: Transaction status query

### Identifier Types
- `1`: MSISDN
- `2`: Till Number
- `4`: Organization Shortcode

### Response Types (C2B)
- `Completed`: Confirmation URL only
- `Cancelled`: Validation URL only (not supported)

### Transaction Types
- `Pay Bill`: Customer to Business payment
- `Buy Goods`: Customer to Business buy goods
- `Business to Customer`: Business to Customer payment

### Password Special Characters
- Limited to: `#`, `&`, `%`, `$`
- Avoid: `(`, `)`, `@` (treated as normal character)

### Account Types (B2C/Balance)
- `Utility Account`: Receives payments, used for disbursements
- `Working Account (MMF)`: Transition account for settlement
- `Charges Paid Account`: Deducts transaction charges
- `Organization Settlement Account`: Final settlement account</content>
<parameter name="filePath">e:\dev\projects\safaricom-daraja-django-nextjs\IMPORTANT_CODES.md
