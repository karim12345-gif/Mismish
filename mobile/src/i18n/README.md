# Mobile localization

The customer app supports English (`en`) and Arabic (`ar`). Static interface
copy belongs in the matching namespace in both `locales/en.json` and
`locales/ar.json`; the two catalogs must always have identical keys.

## Language and direction

`setAppLanguage` in `index.ts` is the only language-switching entry point. It
persists the user's choice and updates React Native's RTL direction. A reload is
required only when the direction changes.

Use `useTranslation()` in screens and components. Keep IDs, route names, API
values, and status enums language-neutral and translate them only when they are
rendered.

## Backend content

`getLocalizedName` in `localizedContent.ts` selects `nameArabic` for Arabic and
falls back to `name`. Merchant-entered listing names, descriptions, categories,
and addresses remain exactly as stored until the backend adds corresponding
Arabic fields.

## OTP

The selected app language is sent with OTP requests. The backend maps English
to Authentica template 7 and Arabic to template 8. See
`backend/docs/AUTHENTICA_OTP.md` for environment variables and request flow.

## Verification

After changing translations, run:

```sh
npx tsc --noEmit
```

Also verify that the flattened keys in `en.json` and `ar.json` match before
shipping.
