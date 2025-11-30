## Demo Admin (Pre-seeded)

Use these demo credentials during development to access admin features immediately. The first admin user must be created through the signup API only when no users exist.

- **Name:** Hubly Admin  
- **Email:** `admin@hublycrm.com`  
- **Password:** `Admin@1234`

> **Important:** The `POST /api/auth/signup` endpoint only allows the first user creation (verified via checking `User.countDocuments() === 0`). Subsequent admins must be added via the admin-only `POST /api/users` endpoint.

---