Run the full stack locally with Docker Compose

This repository includes `docker-compose.full.yml` to start Postgres, the backend, and the frontend (static build served by nginx).

Steps:

1. Copy environment file and edit secrets if desired:

```bash
cp .env.example .env
```

2. Build and start services:

```bash
docker-compose -f docker-compose.full.yml up --build -d
```

3. Visit the app:
- Backend: http://localhost:8080
- Frontend: http://localhost:5173
- Adminer: http://localhost:8081

4. To run Playwright E2E tests against the running stack:

```bash
# install playwright browsers once
cd frontend
npx playwright install --with-deps
# run E2E
npm run test:e2e
```

Notes:
- Flyway migrations will run automatically when the backend starts.
- Use `docker-compose -f docker-compose.full.yml down` to stop and remove services.
