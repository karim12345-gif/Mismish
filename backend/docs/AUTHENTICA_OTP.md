# Authentica OTP

Mismish uses Authentica for customer SMS OTP delivery and verification. Firebase
Cloud Messaging remains responsible for push notifications; Firebase Phone Auth
is not used by the customer OTP screen.

## Request Flow

1. The mobile app calls `POST /api/auth/v1/send-otp` with an E.164 phone number.
2. The backend calls Authentica's `/send-otp` endpoint using its server-side API key.
3. The customer enters the SMS code in the mobile app.
4. The mobile app calls `POST /api/auth/v1/verify-otp`.
5. The backend asks Authentica to verify the code, then creates the existing Mismish
   access and refresh tokens.

The Authentica API key must never be added to the mobile app or committed to Git.
Authentica's configured templates issue four-digit verification codes, so the
backend and mobile app both validate exactly four digits.

## Environment

Configure these variables locally and in Railway:

```text
AUTHENTICA_API_KEY=<server-side Authentica API key>
AUTHENTICA_TEMPLATE_ID_EN=7
AUTHENTICA_TEMPLATE_ID_AR=8
SMS_DEV_MODE=false
```

The mobile app sends its current language with OTP send and resend requests.
Template `7` is used for English and template `8` for Arabic. Requests from
older clients without a language continue to use English.

For local development without sending real SMS messages, set `SMS_DEV_MODE=true`.
The backend prints a development code and the mobile form is prefilled with it.

## Existing Endpoints

- `POST /api/auth/v1/send-otp`
- `POST /api/auth/v1/verify-otp`
- `POST /api/auth/v1/resend-otp`

The existing five-minute expiry and resend limit remain in Mismish. Authentica
owns production code generation and code verification.
