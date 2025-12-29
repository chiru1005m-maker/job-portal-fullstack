# multi-stage Dockerfile
FROM maven:3.8.8-jdk-11 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -B -DskipTests clean package

FROM eclipse-temurin:11-jre
WORKDIR /app
COPY --from=build /app/target/job-portal-backend-0.1.0.jar ./job-portal-backend.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/job-portal-backend.jar"]