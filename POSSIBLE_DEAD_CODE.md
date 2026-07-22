# Possible Dead Code

These files were not deleted because they may still be useful as design variants, future login surfaces, or dynamic imports that static search cannot prove unused.

## Review Later

- `components/site/login/EmailCodeLoginForm.tsx`
- `components/site/login/LoginPrivacyBar.tsx`
- `components/site/login/LoginShell.tsx`
- `components/site/login/QRLoginCard.tsx`

## Reason

The active `/login` route uses `components/login/LoginPageShell.tsx`. Static reference checks did not find route-level imports for the listed `components/site/login/*` component files, while related hooks in the same folder are still used by active login components.

## Recommendation

Keep these files for the GitHub upload. After product/design confirmation, either reconnect them intentionally or delete them in a focused cleanup PR with visual regression checks.
