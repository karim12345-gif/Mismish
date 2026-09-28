# Backend Code Organization

The backend follows a feature-module architecture. HTTP contracts stay at the
module root while implementation details live in responsibility-based service
files.

## Module flow

```text
route -> validation middleware -> controller -> service facade
      -> responsibility service -> Prisma/shared provider
```

- `*.routes.ts` defines URLs, authorization, and validation.
- `*.schemas.ts` owns request validation.
- `*.controller.ts` translates HTTP requests and responses.
- `*.service.ts` is the stable public facade imported by controllers.
- `services/*.service.ts` owns one business responsibility.
- `shared/lib` contains stable compatibility facades and infrastructure entry
  points used across modules.

## Authentication

`modules/auth/auth.service.ts` preserves the existing public API and delegates
to:

- `customer-auth.service.ts`: SMS OTP, passwords, refresh tokens, and sessions
- `social-auth.service.ts`: Google, Apple, and Firebase identity verification
- `vendor-auth.service.ts`: merchant registration, login, and password reset
- `admin-auth.service.ts`: admin login and token creation

The Authentica provider remains in `shared/lib/authentica.ts`; OTP provider
selection remains in `shared/lib/sms.ts`.

## Notifications

`shared/lib/notificationService.ts` is the central delivery facade. It owns
device-token lookup, provider payloads, batching, and delivery logging.

`shared/notifications/order-notification.service.ts` owns only order
eligibility, reminder timing definitions, database claims, idempotency, and
completion notification state. It sends through the central facade callback;
it does not communicate with Firebase or Expo directly.

## Email

`shared/lib/email.ts` is the stable import facade.

- `shared/email/email.client.ts`: Resend and environment configuration
- `shared/email/password-email.service.ts`: password lifecycle messages
- `shared/email/vendor-email.service.ts`: merchant lifecycle messages

## Admin

`modules/admin/admin.service.ts` delegates to:

- `admin-query.service.ts`: dashboard and list queries
- `admin-moderation.service.ts`: user/vendor moderation
- `admin-notification.service.ts`: admin campaigns
- `admin-audit.service.ts`: current admin and audit logging

## Vendor and order modules

Vendor services are separated into profile, listing, follower notification,
and order-status responsibilities. Customer order services are separated into
commands, queries, and development-only status helpers.

## Compatibility rule

Controllers import only the stable `*.service.ts` facades. Internal files may
be reorganized without changing routes, payloads, response shapes, database
queries, or provider behavior. Any behavior change must be implemented and
reviewed as a separate task.

## Verification

Run from `backend/`:

```sh
npm run build
```

This regenerates Prisma Client and performs the strict TypeScript build.
