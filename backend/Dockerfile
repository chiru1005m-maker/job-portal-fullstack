# Build stage
FROM maven:3.8.5-openjdk-11 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
# We use -DskipTests to ensure the build doesn't fail due to missing DB connection during compile
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:11-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
