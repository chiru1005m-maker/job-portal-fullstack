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
