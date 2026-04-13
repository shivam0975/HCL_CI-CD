# Angular App Folder Structure

This project uses a scalable folder setup under `src/app`:

- `core/`: singleton app-wide logic
  - `services/`: API and global services
  - `guards/`: route guards
  - `interceptors/`: HTTP interceptors
  - `models/`: app domain models
- `shared/`: reusable UI building blocks
  - `components/`: shared components
  - `directives/`: shared directives
  - `pipes/`: shared pipes
- `features/`: feature-focused modules/pages
  - `home/`: home feature
  - `auth/`: authentication feature
- `layouts/`: app shell/layout components
  - `main-layout/`: primary authenticated/public layout
- `pages/`: standalone pages
  - `not-found/`: fallback route page
- `state/`: centralized state management (optional)

Keep feature-specific code inside each feature folder.
Move only truly reusable pieces into `shared`.
