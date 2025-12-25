# Tax Remittance

## Overview

This API enables businesses to remit tax to Kenya Revenue Authority (KRA). To use this API, prior integration is required with KRA for tax declaration, payment registration number (PRN) generation, and exchange of other tax-related information.

Request Body

    {    
       "Initiator":"TaxPayer",
       "SecurityCredential":"FKXl/KPzT8hFOnozI+unz7mXDgTRbrlrZ+C1Vblxpbz7jliLAFa0E/…../uO4gzUkABQuCxAeq+0Hd0A==",
       "Command ID": "PayTaxToKRA",
       "SenderIdentifierType": "4",
       "RecieverIdentifierType":"4",
       "Amount":"239",
       "PartyA":"888880",
       "PartyB":"572572",
       "AccountReference":"353353",
       "Remarks":"OK",
       "QueueTimeOutURL":"https://mydomain.com/b2b/remittax/queue/",
       "ResultURL":"https://mydomain.com/b2b/remittax/result/",
    }

Request Parameter Definition

**Name**

**Description**

**Type**

**Sample Values**

CommandID

This value specifies the type of transaction.

String

PayTaxToKRA

Initiator

The M-Pesa API operator username.

String

Username, user_name

SecurityCredential

The encrypted password of the M-Pesa API operator. The process for encrypting the initiator password has been described under docs. An online encryption tool is available under the test credentials section.

String

32SzVdmCvjpmQfw3X2RK8UAv7xuhhkgjfgHAJSGFH

JgagfagFHAGHFSGhjgsfhjasKHSAGfdghsfhdfjhfDGHF

SJGHDFGJshfdksjkd;ahbHJGXCJHGXHJGCH`JGZCKXJ

 `GASYAHC`JGXZCSAGulsuiduisa304dXxFC5+3lslkk2

TDJY/Lh6ESVwtqMxJzF7qA==

PartyA

This is your own shortcode from which the money will be deducted.

Number

Shortcode (5-6 digits) e.g., 123454

SenderIdentifierType

The type of shortcode from which money is deducted. For this API, only "4" is allowed.

Number

4

PartyB

The account to which money will be credited.

Number

For this use case, only 572572 is allowed.

RecieverIdentifierType

The type of shortcode to which money is credited. For this API, only "4" is allowed.

Number

4

Amount

The transaction amount.

Number

3000

Account Reference

The payment registration number (PRN) issued by KRA.

String

PRN1234XN

Remarks

Any additional information to be associated with the transaction.

String

Sentence of up to 100 characters.

QueueTimeOutURL

A URL that will be used to notify your system in case the request times out before processing.

URL

https://ip:port/path or domain:port/path

ResultURL

A URL that will be used to send transaction results after processing.

URL

https://ip:port/path or domain:port/path

'

Response Body

    {
        "OriginatorConversationID": "5118-111210482-1",
        "ConversationID": "AG_20230420_2010759fd5662ef6d054",
        "ResponseCode": "0"
        "ResponseDescription": "Accept the service request successfully."
    }

Response Parameter Definition

**Name**

**Description**

**Type**

                    **Sample Values**

OriginatorConverstionID

Unique request identifier assigned by Daraja upon successful request submission.

String

A string of fewer than 20 characters

ConversationID

Unique request identifier assigned by M-Pesa upon successful request submission.

String

AG_20230420_2010759fd5662ef6d054

ResponseCode

Status code for request submission. 0(zero) indicates successful request submission.

String

0

ResponseDescription

A descriptive message of the request submission status.

String

Accept the service request successfully.

Successful Result Body

    {    
     "Result":
     {  
       "ResultType": "0",    
       "ResultCode":"0",    
       "ResultDesc": "The service request is processed successfully",    
       "OriginatorConversationID":"626f6ddf-ab37-4650-b882-b1de92ec9aa4",    
       "ConversationID":"AG_20181005_00004d7ee675c0c7ee0b",    
       "TransactionID":"QKA81LK5CY",    
       "ResultParameters":
         {    
           "ResultParameter":
              [{
               "Key":"DebitAccountBalance",    
               "Value":"{Amount={CurrencyCode=KES, MinimumAmount=618683, BasicAmount=6186.83}}",    
              },
               "Key":"Amount",    
               "Value":"190.00",    
              },
               "Key":"DebitPartyAffectedAccountBalance",    
               "Value":"Working Account|KES|346568.83|6186.83|340382.00|0.00",    
              },
               "Key":"TransCompletedTime",    
               "Value":"20221110110717",    
              },
               "Key":"DebitPartyCharges",    
               "Value":"",    
              },
               "Key":"ReceiverPartyPublicName",    
               "Value":"00000 - Tax Collecting Company",    
              },
               "Key":"Currency",    
               "Value":"KES",    
              },
               "Key":"InitiatorAccountCurrentBalance",    
               "Value":"{Amount={CurrencyCode=KES, MinimumAmount=618683, BasicAmount=6186.83}}",    
              }]

          },
            "ReferenceData":
              {    
               "ReferenceItem":
                {    
                 "Key":"BillReferenceNumber",    
                 "Value":"19008",    
                },    
                {    
                 "Key":"QueueTimeoutURL",    
                 "Value":"https://mydomain.com/b2b/remittax/queue/",    
                }    
              }
          }
       }
    }

Successful Result Parameter Definition

**Name**

**Description**

**Type**

**Sample Values**

Result

The root parameter encloses the entire result message.

JSON Object

"Result":{ }

ConversationId

Unique request identifier assigned by M-Pesa upon successful request submission.

String

236543-276372-2

OriginatorConversationId

Unique request identifier assigned by API gateway upon successful request submission.

String

AG_2376487236_126732989KJHJKH

 

ResultDesc

A descriptive message for the transaction result.

String

The service request is processed successfully.

ResultType

A status code indicating whether the transaction was already sent to your listener. The usual value is 0.

Number

0

ResultCode

A transaction result status code. 0(zero) indicates successful processing.

Number

0

TransactionID

Unique M-PESA transaction ID for the payment request.

String

LHG31AA5TX

ResultParameters

This is a JSON object that holds more details for the transaction.

JSON Object

"Result":{"ResultParameters":{"ResultParameter":[ ]}}

Amount

The transaction amount that was transacted.
                                    Returned as one of the key-value objects under the ResultParameter array.

Number

100

TransactionCompletedTime

A 14-digit timestamp indicates the date and time the transaction was completed on M-PESA.
                                    Returned as one of the key-value objects under the ResultParameter array.

Number

20171206163233

DebitPartyCharges

Transaction fee deducted on the debit party if applicable. Value is empty if no charges apply.
                                    Returned as one of the key-value objects under the ResultParameter array.

Number

1

ReceiverPartyPublicName

The public name of the credit party/organization.
                                    Returned as one of the key-value objects under the ResultParameter array.

String

600000 - saf test org

Currency

A currency code of the transaction amount.
                                    Returned as one of the key-value objects under the ResultParameter array.

String

KES

DebitPartyAffectedAccountBalance

The balance in the organization's account from which funds were deducted under the shortcode.
                                    Returned as one of the key-value objects under the ResultParameter array.

String

Working Account|KES|500000.00|599490.00|0.00|0.00

DebitAccountCurrentBalance

The balance in the organization's account from which funds were deducted under the shortcode.
                                    Returned as one of the key-value objects under the ResultParameter array.

String

{Amount={CurrencyCode=KES, MinimumAmount=59949000, BasicAmount=599490.00}}

InitiatorAccountCurrentBalance

The balance in the organization accounts from which funds were deducted under the shortcode.
                                    Returned as one of the key-value objects under the ResultParameter array.

String

{Amount={CurrencyCode=KES, MinimumAmount=59949000, BasicAmount=599490.00}}

ReferenceData

This JSON object holds more details for the transaction reference data.

JSON Object

"ReferenceData": {"ReferenceItem": []}

ReferenceItem

A JSON array that holds JSON Objects with additional transaction details.

JSON Object

ReferenceItem": [{"Key": "BillReferenceNumber", "Value": "19008" }, {"Key": "", "Value": "" }]]

Unsuccessful Results Body

    {    
     "Result":
     {  
       "ResultType": "0",    
       "ResultCode":2001,    
       "ResultDesc": "The initiator information is invalid.",    
       "OriginatorConversationID":"12337-23509183-5",    
       "ConversationID":"AG_20200120_0000657265d5fa9ae5c0",    
       "TransactionID":"OAK000000",    
       "ResultParameters":
         {    
           "ResultParameter":
              [{
               "Key":"BOCompletedTime",    
               "Value":"20200120164825",    
              }]

          },
            "ReferenceData":
              {    
               "ReferenceItem":

                {    
                 "Key":"QueueTimeoutURL",    
                 "Value":"https://mydomain.com/b2b/remittax/queue/",    
                }    
              }
          }
       }
    }

Failed Result Parameter Definition

**Name**

**Description**

**Type**

**Sample Values**

Result

The root parameter encloses the entire result message.

JSON Object

"Result":{ }

ConversationId

Unique request identifier assigned by M-Pesa upon successful request submission.

String

236543-276372-2

OriginatorConversationId

Unique request identifier assigned by API gateway upon successful request submission.

String

AG_2376487236_126732989KJHJKH

 

ResultDesc

A descriptive message for the transaction result.

String

The initiator information is invalid.

ResultType

A status code indicating whether the transaction was already sent to your listener. The usual value is 0.

Number

0

ResultCode

A transaction result status code. 0(zero) indicates successful processing.

Number

2001

TransactionID

Unique M-PESA transaction ID for the payment request.

String

OAK0000000

ResultParameters

This is a JSON object that holds more details for the transaction.

JSON Object

ResultParameters:{"ResultParameter":{"Key":"BOCompletedTime","Value":20200120164825}}

ReferenceData

This JSON object holds more details for the transaction reference data.

JSON Object

"ReferenceData": {"ReferenceItem": []}

ReferenceItem

A JSON array that holds JSON Objects with additional transaction details.

JSON Object

ReferenceItem": [{"Key": "BillReferenceNumber", "Value": "19008" }, {"Key": "", "Value": "" }]]
