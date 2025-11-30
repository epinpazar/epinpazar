
epinpazar - Full Marketplace (MVP) Quickstart

This package contains a ready-to-deploy marketplace MVP:
- Backend: Node.js (Express) + Sequelize + SQLite
- Frontend: simple static pages served from /public (index, login, register, add, admin)
- Admin user created by seed: admin@epin.test / admin123
- Demo user: user@epin.test / user123

Quick local start (no terminal required if using Render):
1) Deploy backend on Render as a Web Service (connect GitHub or upload ZIP)
   - Start command: node server.js
   - Ensure environment variables (optional): JWT_SECRET, ADMIN_EMAIL
2) Deploy static frontend as Render Static Site or use the backend's /public path.
   - Frontend already included in /public and served by backend at root.
3) To seed DB (if running locally): node scripts/seed.js
4) Backend endpoints:
   - POST /api/register
   - POST /api/login
   - POST /api/listings (auth)
   - GET /api/listings (public)
   - GET /api/admin/listings (admin)

Security & Production notes:
- Replace SQLite with PostgreSQL for production
- Use cloud file storage for uploads (S3)
- Add HTTPS, rate-limits, input validation, and email verification
