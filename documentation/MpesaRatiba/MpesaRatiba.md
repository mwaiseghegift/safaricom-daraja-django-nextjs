# M-Pesa Ratiba

## Prerequisites

        Knowledge of RESTful principles and JSON.
        Understanding Asynchronous processing and callback handling.
        Set up an App on Daraja to be used for testing on the simulator. Ensure to select "M-Pesa Ratiba" when creating the app

M-PESA Ratiba API is an extension of the Safaricom Standing order functionality that will allow third party integrators to avail this functionality to their users.

(STK Push/NI push) is a Merchant/Business initiated prompt, that will allow M-Pesa user to enter their pin for authentication and user validation purposes.

Once you, our merchant integrate with the API, you will be able to send a pin prompt on the customer's phone (Popularly known as STK Push Prompt) to your customer's M-PESA registered phone number requesting them to enter their M-PESA pin to authorize, and continue with the rest of the journey involving opt in and creating a standing order.

    ## High Level user flow

        A user will probably interact with the integrated API through the merchant’s digital channel, could be a web interface or an app interface. The user will enter the standing order details, including the name, amount, start date, end date, etc. – (As per the merchant’s configurations on the digital channel.)
        The merchant channel, through the API will send the data to our systems. Here we will run the authentication checks through our gateway. Once authenticated, we will initiate an NI push to the M-Pesa user. The user will enter their pin. This will be consent to proceed with all operations coming after and also validate ownership of the MSISDN.
        We will run a check to see if the user is opted in, if not, we will opt the user in. If the user is opted in, we will proceed with the request to create a standing order.
        We will then send a callback to the merchant, with the status of the process, the transaction code and the unique response id

Request Description

1.   URL: https://sandbox.safaricom.co.ke/standingorder/v1/createStandingOrderExternal         [](https://apistg.safaricom.co.ke/standingorder/v1/createStandingOrderExternal).

2.   Method: POST

3.   Parameters: StandingOrderName, StartDate, EndDate,BusinessShortCode, TransactionType, Amount, PartyA, PartyB, PhoneNumber, CallBackURL, TransactionDesc, Frequency

**You will first
                generate an access token to allow you to make the API call. See how to generate an access token here [Authorization API link](https://developer.safaricom.co.ke/APIs/Authorization). ****We’ve also automated
            this on the simulate request section.**

Request Body

    {    
       "StandingOrderName":"Test Standing Order",
       "StartDate":"20240905",
       "EndDate":"20230905",
       "BusinessShortCode":"174379",
       "TransactionType":"Standing Order Customer Pay Bill",
         "ReceiverPartyIdentifierType":"4",
       "Amount":"4500",
       "PartyA":"254708374149",
         "CallBackURL":"https://mydomain.com/pat",
          "AccountReference":"Test",
           "TransactionDesc":"Test",
            "Frequency":"2",
    }

Request Parameter Definition

|  |
| --- |

**Name**

|  |
| --- |

** Description **

|  |
| --- |

**Type**

|  |
| --- |

                    **Sample Values**

|  |
| --- |

StandingOrderName

|  |
| --- |

Name of standing order. Note that Standing Order (M-Pesa Ratiba) name must be unique for each customer. A customer can not create two Standing Orders with the same name.

|  |
| --- |

String

|  |
| --- |

"Phone Lipa Mdogo Mdogo"

|  |
| --- |

StartDate

|  |
| --- |

The date you wish for the standing order to start executing

|  |
| --- |

Date(yyyymmdd)

|  |
| --- |

"20240905"

|  |
| --- |

EndDate

|  |
| --- |

The date you wish for the standing order to stop executing

|  |
| --- |

Date(yyyymmdd)

|  |
| --- |

"20250905"

|  |
| --- |

BusinessShortCode

|  |
| --- |

The business short code to which the payment is to be sent

|  |
| --- |

String

|  |
| --- |

                    "1112223"

|  |
| --- |

TransactionType

|  |
| --- |

This is the transaction type that is used to identify the transaction when sending the request to M-PESA. Use "Standing Order Customer Pay Bill" for paybill or "Standing Order Customer Pay Marchant" for buy goods

|  |
| --- |

String

|  |
| --- |

"Standing Order Customer Pay Bill"

|  |
| --- |

Amount

|  |
| --- |

This is the Amount transacted normally a numeric value. Money that the customer pays to the Shortcode. Only whole numbers are supported. This will be deducted from user’s mpesa balance each time the standing order executes.

|  |
| --- |

String

|  |
| --- |

"100"

|  |
| --- |

PartyA

|  |
| --- |

The phone number sending money.The parameter expected is a Valid Safaricom Mobile Number that is M-PESA registered in the format 2547XXXXXXXX

|  |
| --- |

String

|  |
| --- |

"254712345678"

|  |
| --- |

CallBackURL

|  |
| --- |

A CallBack URL is a valid secure URL that is used to receive notifications from the Standing Order Solution. It is the endpoint to which the results will be sent.

|  |
| --- |

String URL

|  |
| --- |

"https://mydomain.com/callback"

|  |
| --- |

AccountReference

|  |
| --- |

Account Reference: This is a  parameter that is defined by your system as an Identifier of the transaction for the StandingOrderCustomerPayBill transaction type (Account number usually given when making paybill payment). Maximum of 12 characters.

|  |
| --- |

Alpha numeric

|  |
| --- |

"Test"

|  |
| --- |

TransactionDesc

|  |
| --- |

This is any additional information/comment that can be sent along with the request from your system. Maximum of 13 Characters

|  |
| --- |

String

|  |
| --- |

"Electric Bike Repayment"

|  |
| --- |

Frequency

|  |
| --- |

This is a value representing the frequency at which you would like the transactions to happen. Valid values are:

                    1 - One Off
                    2 - Daily
                    3 - Weekly
                    4 - Monthly
                    5 - Bi-Monthly
                    6 - Quarterly
                    7 - Half Year
                    8 - Yearly

|  |
| --- |

String

|  |
| --- |

"2"

|  |
| --- |

ReceiverPartyIdentifierType

|  |
| --- |

The ReceiverPartyIdentifierType is the code our systems uses to identify the short code in the request body. The value is "2" for a Merchant till (Till Number), and "4" for a Business Short Code (PayBill)

|  |
| --- |

String

|  |
| --- |

"4"

Response Body

    {    
          "ResponseHeader": {            
             "responseRefID": "4dd9b5d9-d738-42ba-9326-2cc99e966000",            
             "responseCode": "200",            
             "responseDescription": Request accepted for processing,            
             "ResultDesc": "The service request is processed successfully."           

             }        
            "ResponseBody": {            

             "responseDescription": Request accepted for processing,            
             "responseCode": "200"           

             }        

    }

Response Parameter Definition

|  |
| --- |

**Name**

|  |
| --- |

**Description**

|  |
| --- |

**Type**

|  |
| --- |

                    **Sample Values**

|  |
| --- |

ResponseHeader

|  |
| --- |

Contains MetaData of the response data

|  |
| --- |

String

|  |
| --- |

""ResponseHeader":
                {"responseRefID": "4dd9b5d9-d738-42ba-9326-2cc99e966000",
         "requestRefID": "c8c2bb31-3b3a-402e-84fc-21ef35161e48",
         "responseDescription": Request Processed successfully,     } , "

|  |
| --- |

responseRefID

|  |
| --- |

Contained in the response header - Is a  value, unique per request, used to track and trace a request and a response across the application systems.

|  |
| --- |

String

|  |
| --- |

"4dd9b5d9-d738-42ba-9326-2cc99e966000"

|  |
| --- |

responseCode

|  |
| --- |

This is http response code. This can be 200 for a succesflu request, 401 for an unathorized request and 500 for a system failiure.

|  |
| --- |

String

|  |
| --- |

"200"

|  |
| --- |

ResultDesc

|  |
| --- |

Contained in the response header - is a message giving a description of the status, progress, error, success or failiure of the request.

|  |
| --- |

String

|  |
| --- |

                    "The service request is processed successfully."

|  |
| --- |

ResponseBody

|  |
| --- |

Encaplulates response body metadata

|  |
| --- |

String

|  |
| --- |

 "ResponseBody": {
         "responseDescription": Request accepted for processing,
         "responseCode": "200",
         }

|  |
| --- |

responseDescription

|  |
| --- |

This gives a descriptive message on the Async request sent for proccesing. This is in correspondance with the result code

|  |
| --- |

String

|  |
| --- |

"Request accepted for processing"

|  |
| --- |

responseCode

|  |
| --- |

This is http response code. This can be "200" for a successful request, "401" for an unathorized request and "500" for a system failiure.

|  |
| --- |

String

|  |
| --- |

"200"

Example CallBack Response

        {

           "responseHeader": {

             "responseRefID": "0acc0239-20fa-4a52-8b9d-9bd64c0465c3",

             "requestRefID": "0acc0239-20fa-4a52-8b9d-9bd64c0465c3",

             "responseCode": "0",

             "responseDescription": "The service request is processed successfully"

             },

           "responseBody": {

             "responseData": [

              {

                "name": "TransactionID",

                "value": "SC8F2IQMH5"

              },

              {

                "name": "responseCode",

                "value": "0"

              },

              {

                "name": "Status",

                "value": "OKAY"

              {

                "name": "Msisdn",

                "value": "254******867"

              },

              }

              ]

             }

        }

CallBack Response Parameter Definition

|  |
| --- |

**Name**

|  |
| --- |

** Description **

|  |
| --- |

**Type**

|  |
| --- |

                    **Sample Values**

|  |
| --- |

ResponseHeader

|  |
| --- |

Contains MetaData of the response data

|  |
| --- |

JSON Object

|  |
| --- |

"ResponseHeader": {"responseRefID": "4dd9b5d9-d738-42ba-9326-2cc99e966000", "requestRefID": "c8c2bb31-3b3a-402e-84fc-21ef35161e48", "responseDescription": "Request Processed successfully"}

|  |
| --- |

responseRefID

|  |
| --- |

Contained in the response header - Is a value, unique per request, used to track and trace a request and a response across the application systems.

|  |
| --- |

String

|  |
| --- |

"4dd9b5d9-d738-42ba-9326-2cc99e966000"

|  |
| --- |

requestRefID

|  |
| --- |

Contained in the response header - Is a Client generated value, unique per request, used to track and trace a request and a response across the application systems.

|  |
| --- |

String

|  |
| --- |

"c8c2bb31-3b3a-402e-84fc-21ef35161e48"

|  |
| --- |

responseDescription

|  |
| --- |

Contained in the response header - is a message giving a description of the status, progress, error, success or failure of the request.

|  |
| --- |

String

|  |
| --- |

                    "Request Processed successfully"

|  |
| --- |

ResponseBody

|  |
| --- |

Encapsulates response body metadata

|  |
| --- |

JSON Object

|  |
| --- |

"ResponseBody": {"ResponseData": [{"Name": "TransactionID", "Value": "SC8F2IQMH5"}, {"Name": "ResultCode", "Value": "0"}]}

|  |
| --- |

ResponseData

|  |
| --- |

Contains Details of the response body in Key Value pairs. The values are TransactionID and ResultCode

|  |
| --- |

JSON Object

|  |
| --- |

"ResponseData": [{"Name": "TransactionID", "Value": "SC8F2IQMH5"}, {"Name": "ResultCode", "Value": "0"}]

Unsuccessful CallBack Response

    {

        "ResponseHeader": {

        "responseRefID": "4dd9b5d9-d738-42ba-9326-2cc99e966000",

        "requestRefID": "c8c2bb31-3b3a-402e-84fc-21ef35161e48",

        "responseCode": "1037",

        "responseDescription": Error
    },

        "ResponseBody": {

        "ResponseData": [
    {

        "Name": "TransactionID",

        "Value": "0000000000",
    },
    {

        "Name": "responseCode",

        "Value": "1037",
    },
    {

        "Name": "Status",

        "Value": "ERROR"
    },
    {

        "Name": "Msisdn",

        "Value": "*********149"
    }
    ]
    }
    }

Unsuccessful CallBackResponse Parameter Definition

|  |
| --- |

**Name**

|  |
| --- |

** Description **

|  |
| --- |

**Type**

|  |
| --- |

                    **Sample Values**

|  |
| --- |

ResponseHeader

|  |
| --- |

Contains MetaData of the response data

|  |
| --- |

JSON Object

|  |
| --- |

"ResponseHeader": {"responseRefID": "4dd9b5d9-d738-42ba-9326-2cc99e966000", "requestRefID": "c8c2bb31-3b3a-402e-84fc-21ef35161e48", "responseDescription": "Request Processed successfully"}

|  |
| --- |

responseRefID

|  |
| --- |

Contained in the response header - Is a value, unique per request, used to track and trace a request and a response across the application systems.

|  |
| --- |

String

|  |
| --- |

"4dd9b5d9-d738-42ba-9326-2cc99e966000"

|  |
| --- |

requestRefID

|  |
| --- |

Contained in the response header - Is a Client generated value, unique per request, used to track and trace a request and a response across the application systems.

|  |
| --- |

String

|  |
| --- |

"c8c2bb31-3b3a-402e-84fc-21ef35161e48"

|  |
| --- |

responseDescription

|  |
| --- |

Contained in the response header - is a message giving a description of the status, progress, error, success or failure of the request.

|  |
| --- |

String

|  |
| --- |

                    "An Error occured while processing your request"

|  |
| --- |

ResponseBody

|  |
| --- |

Encapsulates response body metadata

|  |
| --- |

JSON Object

|  |
| --- |

"ResponseBody": {"ResponseData": [{"Name": "TransactionID", "Value": "SC8F2IQMH5"}, {"Name": "ResultCode", "Value": "0"}]}

|  |
| --- |

ResponseData

|  |
| --- |

Contains Details of the response body in Key Value pairs. The values are TransactionID and ResultCode

|  |
| --- |

JSON Object

|  |
| --- |

"ResponseData": [{"Name": "TransactionID", "Value": "SC8F2IQMH5"}, {"Name": "ResultCode", "Value": "3001"}]
