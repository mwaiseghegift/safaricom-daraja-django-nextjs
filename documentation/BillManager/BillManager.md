# Bill Manager

### Pre-Condition.

 Your business pay bill must have been onboarded to bill manager for us to push payments to you and for bill manager to receive your payment acknowledgment details. Please see the bill manager onboarding documentation for more details.

### Bill Manager Payments flow.

1.   An M-PESA Customer will make a C2B payment to your pay bill number with the correct account number (account reference) via the USSD, Sim tool kit, M-PESA App, Safaricom App, and from the bill manager e-invoice.

 2.   Bill Manager will receive the payment and push it to you for acknowledgment via the call-back URL you provided during onboarding. The payments will have the following structure.

    **Important Information**

We will try to send payment details 5 times to your callback URL before cancelling the request.

### Sample Payment API Request and Response

### Request Body

    {  "transactionId":"{trandID}", 
      "paidAmount":"{50}", 
      "msisdn":"254710119383", 
      "dateCreated":"2021-09-15", 
      "accountReference":"LGHJIO789", 

      "shortCode":"349350555

}

### Request Parameter Definition

**Name**

**Description**

** Type**

**Sample Values**

transactionId

The M-PESA generated reference.

String(Varchar)|Required

RJB53MYR1N

paidAmount

Amount Paid In KES

Numeric

5000

msisdn

The customers PhoneNumber debited

Numeric

254722000000

dateCreated

The date the payment was done and recorded in the BillManager System

Date

2021-10-01

accountReference

This is the account number being invoiced that uniquely identifies a customer. It could be a customer name, business name, a property unit, a student’s name etc.

AlphaNumeric

BC001

shortCode

This is organizations shortcode (Paybill or Buygoods - A 5 to 6 digit account number) used to identify an organization and receive the transaction.

Numeric

456545

### Response Body

    {  "resmsg":"Success", 
      "rescode":"200"

}

### Response Parameter Definition

**Name**

**Description**

**Sample Values**

resmsg

This is a message from the API that gives the status of the request processing and usually maps to a specific result code value.

Success

rescode

Numeric

200

 3.   Once the payment details are availed to you, you will reconcile the payment on your end and send an acknowledgment message to the bill manager acknowledgment endpoint. Acknowledgment details sent to bill manager must contain the following:

           • Payment Date

           • Paid Amount

           • Account Reference

           • External Reference

           • Transaction ID

           • Customer Phone Number

           • Customer Full Name

           • Invoice Name

 4.   Upon
    receiving the acknowledgment message, we will process it and send a receipt acknowledgment message to your customers via the phone
    number in the acknowledgment
    API result

Sample Expected Acknowledgment API Structure

### Request Body

    {

      "paymentDate":"2021-10-01",
      "paidAmount":"800",
      "accountReference":"Balboa95",
      "transactionId":"PJB53MYR1N",
      "phoneNumber":"0710XXXXXX",
      "fullName":"John Doe",  "invoiceName":"School Fees",  "externalReference":"955"

}

Request Parameter Definition

**Name**

**Description**

**Parameter Type**

**Sample Values**

Payment Date

This is the date
                    you expect your customer to settle
                    the invoiced amount.

                    Two (2) reminders shall be sent to your invoiced customer i.e. Seven (7) days prior to the due date and on
                    the due date

Date

2021-10-01

Paid Amount

Invoiced amounts will be paid in Kenyan
                    Shillings
                     
                    Special characters
                    such as commas should not be included in the currency amount.

Numeric|Required

| 5000

Account Reference

This
                    is the account number being invoiced
                    that uniquely identifies a customer. It could be a customer name, business name, a property unit, a student’s
                    name etc.

String(Varchar)|Required

D44

Transaction ID

The
                    M-PESA generated reference.

String(Varchar)|Required

PJB53MYR1N

Customer Phone Number

The
                    Safaricom phone number that receives
                    the e- invoice details via sms

Numeric|Required

                     0722XXXXXX

                        0710XXXXXX

Customer Full Name

The
                    name of the invoiced recipient

String(Varchar)|Required

                    Thomas Shelby

                    Tasha WholeSalers

Invoice Name

A descriptive name for what your customer is being billed for.

                    It will appear on the invoice sms sent to your customer.

String(Varchar)|Required

                    damagefee

                    watersupply

Response Body

    {

     "resmsg":"Success",
     "rescode":"200"

    }

Response Parameter Definition

**Name**

**Description**

**Sample Values**

resmsg

| This

                is a message from the API that gives the status of the request processing and usually maps to a specific result code value.

Success

rescode

This is a
                    numeric status code that
                    indicates the status of the transaction processing. 200 means
                    success and any other code means
                    an error occurred or the transaction failed.

200

Cancel Invoice

The single and bulk cancel invoice APIs allow you to recall already sent invoices.

    A partially paid or fully paid invoice cannot be canceled.

            Existing external reference number(s) are used to specify the exact invoice/invoices you want to cancel.

Cancel Single-Invoicing

The single cancel invoice API allows you to recall a sent invoice. This means the invoice will cease to exist and cannot be used as a reference to a payment.

**Endpoint:**
    [https://api.safaricom.co.ke/v1/billmanager-invoice/cancel-single-invoice](https://api.safaricom.co.ke/v1/billmanager-invoice/reconciliation)

**Cancel Invoice - Request Body**

    {

     "externalReference":"113",
    }

Cancel Bulk Invoicing

The bulk cancel invoice API allows to recall more than one sent invoice.

**Endpoint:**
    [ https://sandbox.safaricom.co.ke/v1/billmanager-invoice/cancel-bulk-invoices
    ](https://api.safaricom.co.ke/v1/billmanager-invoice/reconciliation)

**Cancel Invoice - Request Body**

    [
      {

        "externalReference":"113",
      },
      {

        "externalReference":"113",
      }
    ]

Response Body

    {
      "Status_Message":"Invoice cancelled successfuly.",    
      "resmsg": "Success",
      "rescode": "200"
       "errors": []
    }

Cancel Invoice-Error

    {
      "Status_Message":"partially or fully paid invoices cannot be cancelled.",    
      "resmsg": "Conflict",
      "rescode": "409"
      "errors": []
    }

Updating Optin details

**Endpoint:**
    [https://sandbox.safaricom.co.ke/v1/billmanager-invoice/change-optin-details](https://sandbox.safaricom.co.ke/v1/billmanager-invoice/change-optin-details)

This is the API used to update opt-in details.  

**Important Information**

You will use your Daraja access token for all the bill manager-integrated APIs.

    You can use the same consumer key for multiple shortcodes that belong to that consumer key.

Request Body

    {
      "shortcode":"718003",    
      "email":"youremail@gmail.com",    
      "officialContact":"0710XXXXXX",    
      "sendReminders":1,    
      "shortcode":"718003",    
      "logo": "image",
      "callbackurl": "/api.example.com/payments?callbackURL=http://my.server.com/bar"

    }

Request Parameter Definition

**Name**

**Description**

**Parameter Type**

**Possible Values**

email

This is the official contact email address for the organization signing up to bill manager. It will appear in features sent to the customer such as invoices and payment receipts for customers to reach out to you as a business.

String|Required

example@mail.com

officialContact

This is the official contact phone number for the organization signing up to bill manager. It will appear in features sent to the customer such as invoices and payment receipts for customers to reach out to you as a business.

Numeric|Required

e.g. 0710XXXXXX

sendReminders

This field gives you the flexibility as a business to enable or disable sms payment reminders for invoices sent.
A payment reminder is sent 7 days before the due date, 3 days before the due date, and the day the payment is due.
0 - Disable Reminders
1- Enable Reminders

Numeric|Required

0 or 1

logo

Image to be embedded in the invoices and receipts sent to your customer.

Image|Required

JPEG, JPG

callbackurl

This callbackurl will be availed by you to bill manager during the initial opt-in process.
This callbackurl will be invoked by our payments API inorder to push payments done to your paybill.
More details on the callbackURL are in the payments and reconciliation API documentation.

URL|Optional

/api.example.com/payments?callbackURL=http://my.server.com/bar

Response Body

    {

      "resmsg": "Success",
      "rescode": "200"

    }

Response Parameter Definition

**Name**

**Description**

**Sample Values**

Resmsg

This is a message from the API that gives the status of the request processing and usually maps to a specific result code value.

Success

rescode

This is a numeric status code that indicates the status of the transaction processing. 200 means success and any other code means an error occurred or the transaction failed.

200
