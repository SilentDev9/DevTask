# DevTask UI and interaction update

This update focuses on the issues reported from the latest running build.

## Changes

- Increased page and section heading sizes and improved the statistics cards.
- Rebuilt the four statistics metric cards with consistent icon containers and icons.
- Prevented desktop navigation labels from wrapping onto a second line and tightened responsive spacing.
- Added a working in-app notification panel to the dashboard bell. Each account receives a one-time welcome message on its first dashboard visit. Users can mark it as read or dismiss it; the state is stored locally per account on the current device.
- Added keyboard Escape support for closing the notification panel.
- Added the password visibility toggle on the Login page.
- Localized the remaining static labels, form validation messages, status labels, accessibility labels, date display, and number display on the main application pages.
- Localized the splash screen and notification close label.
- Fixed the dashboard logo route and the Home loading splash so it does not redirect to Login while Home is waiting for the user session.
- The existing generated DevTask icon assets remain in `public/icons` and the manifest refers to those files.

## Local setup

1. Keep your existing `.env.local` file outside this archive and copy it into the project root. It must contain your own Supabase project URL and publishable key. Do not share this file or commit it.
2. Run `npm install`.
3. Run `npm run dev` to test locally.
4. Run `npm run build` to create the production build.

The archive does not include `.env.local`, `node_modules`, or any Supabase credentials.

## Notification behavior

The bell currently provides a local in-app notification center with a one-time welcome notification per signed-in account/device. It is not a push notification service and does not send notifications from a server while the app is closed. Server-side task alerts or web push would require a separate backend setup.
