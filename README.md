# Beautiful Brows & Henna dashboard

Administrative dashboard for services, appointments, blog posts, and gallery
images.

## Local setup

1. Copy `.env.example` to `.env.development.local` and set the local backend
   API URL.
2. Install dependencies with `npm ci`.
3. Start the Django API.
4. Run the dashboard with `npm run dev`.

Only Django staff accounts can access the dashboard.

## Production configuration

Production builds intentionally fail when `VITE_API_BASE_URL` is missing or
does not use HTTPS. Configure it in the hosting provider rather than committing
a production `.env` file:

```text
VITE_API_BASE_URL=https://api.beautifulbrowsandhenna.com/api
```

The URL is normalized by the app, so an accidental trailing slash will not
break token refresh.

Before deploying:

1. Deploy the backend and verify its health and migrations.
2. Add the exact dashboard origin, such as
   `https://admin.beautifulbrowsandhenna.com`, to the backend
   `CORS_ALLOWED_ORIGINS`.
3. Set `VITE_API_BASE_URL` separately for Production and Preview environments.
   Do not point preview deployments at production data unless that is
   intentional.
4. Build and test the dashboard, then smoke-test login, token refresh,
   appointment updates, blog management, and image uploads.
5. Rotate all local/test credentials before making the dashboard public and
   create an individual staff account for each administrator.

The dashboard should be hosted at its own HTTPS origin. Admin session storage
is namespaced, but a dedicated origin still provides better isolation from the
customer site.

## Operational security

- The dashboard and Vercel configuration request `noindex` and set a restrictive
  browser security policy. Authentication and backend permissions remain the
  real access controls.
- Multi-factor authentication is not implemented. Add it before expanding
  access beyond trusted staff.
- External error monitoring is not configured. The UI has a safe global error
  fallback, but production exception reporting should be added when a service
  is selected.
- Never place passwords, API secrets, or Django secret keys in `VITE_`
  variables. All `VITE_` values are public in the browser bundle.

## Checks

- `npm test`
- `npm run lint`
- `npm run build`
- `npm audit`
