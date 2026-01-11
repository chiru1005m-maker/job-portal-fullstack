# Job Portal Backend (scaffold)

This is an initial Spring Boot scaffold for the migrated job portal. Key items:

- Entities: `User`, `Job`, `Application` (JPA)
- Repositories: Spring Data JPA
- Controllers: auth, jobs, applications (basic endpoints)
- Flyway migration in `src/main/resources/db/migration/V1__init.sql`
- CSV importer: `CsvImportRunner` reads `data/users.csv`, `data/jobs.csv`, `data/applications.csv` and inserts into DB on startup.

Run: `mvn spring-boot:run` (ensure Java 11+). By default H2 file DB is used (`data/jobportal.mv.db`).

Next steps: add JWT auth, role checks, tests, and more endpoints (search, pagination, file uploads).