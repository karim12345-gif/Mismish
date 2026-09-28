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

The OTP phone and verification screens use the same mobile locale. Their labels,
actions, and known validation errors are available in both English and Arabic.

## Implementation Map

- `mobile/src/components/GuestAuthModal.tsx` owns the OTP flow state and calls the
  existing authentication service.
- `mobile/src/components/guest-auth/` contains the focused phone/verification UI
  components and shared OTP presentation utilities.
- `mobile/src/services/auth/auth.service.ts` sends the selected `en` or `ar`
  language to the backend.
- `src/modules/auth/` validates the request and runs the existing authentication
  flow.
- `src/shared/lib/sms.ts` selects development mode or production delivery.
- `src/shared/lib/authentica.ts` is the only Authentica provider integration and
  maps the selected language to the configured template.

For local development without sending real SMS messages, set `SMS_DEV_MODE=true`.
The backend prints a development code and the mobile form is prefilled with it.

## Existing Endpoints

- `POST /api/auth/v1/send-otp`
- `POST /api/auth/v1/verify-otp`
- `POST /api/auth/v1/resend-otp`

The existing five-minute expiry and resend limit remain in Mismish. Authentica
owns production code generation and code verification.
