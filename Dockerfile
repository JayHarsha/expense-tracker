# Single image: builds the React frontend, bundles it into the Spring Boot jar as
# static resources, and packages the backend. One image, one container, one port -
# the backend serves both the API (/trackage/**) and the SPA (everything else).

FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY trackage-frontend/package.json trackage-frontend/package-lock.json ./
RUN npm ci
COPY trackage-frontend/. .
# Vite bakes env vars into the bundle at build time; the OAuth client ID is
# public by design, so passing it as a build arg is safe.
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
RUN npm run build

FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /backend
COPY trackage-backend/pom.xml .
RUN mvn -q -B dependency:go-offline
COPY trackage-backend/src ./src
COPY --from=frontend-build /frontend/dist ./src/main/resources/static
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /backend/target/trackage-demo.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
