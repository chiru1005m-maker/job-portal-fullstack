## Getting Started

Welcome to the VS Code Java world. Here is a guideline to help you get started to write Java code in Visual Studio Code.

## Folder Structure

The workspace contains two folders by default, where:

- `src`: the folder to maintain sources
- `lib`: the folder to maintain dependencies

Meanwhile, the compiled output files will be generated in the `bin` folder by default.

> If you want to customize the folder structure, open `.vscode/settings.json` and update the related settings there.

## Dependency Management

The `JAVA PROJECTS` view allows you to manage your dependencies. More details can be found [here](https://github.com/microsoft/vscode-java-dependency#manage-dependencies).

---

## Java 21 Upgrade

The backend has been upgraded to target **Java 21** and **Spring Boot 3.3.x**.

### Local setup

- Install JDK 21 (Temurin recommended) and set `JAVA_HOME`.
- Install Apache Maven and ensure `mvn` is on your PATH.
- Verify: `java -version` (should show 21), `mvn -version`.

### Build

Run:

```
mvn -B -DskipTests=false clean package
```

If you don't want to install Maven locally, push your branch and CI will run (GitHub Actions is configured to build using JDK 21).

### Notes

- `javax.*` usages have been migrated to `jakarta.*` for Spring Boot 3 compatibility.
- JJWT has been upgraded to 0.11.5 and `JwtUtil` updated to the new API.

If you'd like, I can also open a PR with these changes and run CI for you.
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
- Add a frontend Docker service to build & serve the UI
- Add GitHub Actions CI to run tests & build
- Implement more UI polish and validation
