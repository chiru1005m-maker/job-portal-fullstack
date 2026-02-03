Quickstart: run locally ✅

Backend (Spring Boot)

- Build (requires Maven):

```bash
cd backend
mvn -B -DskipTests=false clean package
```

- Run with Java:

```bash
java -jar backend/target/job-portal-backend-0.1.0.jar
```

- Or use Docker Compose:

```bash
docker-compose up --build
```

This will start the backend on http://localhost:8080 and persist H2 DB files under `backend/data`.

Frontend (React + Vite)

- Install and run dev server:

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server runs on http://localhost:5173 by default and expects the backend at http://localhost:8080.

Notes about recent changes

- The login endpoint now returns a `token` field alongside setting an HttpOnly cookie so SPAs can read the token if needed.
- Fixed a compile issue in `ApplicationRepository` (missing import) and upgraded the default JWT secret to avoid HS256 key errors during tests.
- A `docker-compose.yml` has been added to spin up the backend quickly.

Next steps I can take on request:
- Add a frontend Docker service to build & serve the UI.
- Add GitHub Actions CI to run tests & build.
- Implement more UI polish and validation.
