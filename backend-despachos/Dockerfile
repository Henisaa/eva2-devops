# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copiar descriptor de dependencias primero (cache layer)
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Descargar dependencias sin compilar (cache)
RUN chmod +x mvnw && sed -i 's/\r$//' mvnw && \
    ./mvnw dependency:go-offline -B --no-transfer-progress

# Copiar código fuente y compilar
COPY src src
RUN ./mvnw package -DskipTests --no-transfer-progress

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar JAR desde el stage de build
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
