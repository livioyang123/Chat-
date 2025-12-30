# Stage 1: Build dependencies
FROM eclipse-temurin:17-jdk-alpine AS dependencies
WORKDIR /build

# Install Maven
ARG MAVEN_VERSION=3.9.9
RUN apk add --no-cache curl tar bash && \
    curl -fsSL https://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz | tar xz -C /opt && \
    ln -s /opt/apache-maven-${MAVEN_VERSION}/bin/mvn /usr/bin/mvn

# Copy only dependency files first (for layer caching)
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .

# Download dependencies (cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Stage 2: Build application
FROM dependencies AS build
WORKDIR /build

# Copy source code
COPY src ./src

# Build application (skip tests for faster builds)
RUN mvn clean package -DskipTests -B && \
    java -Djarmode=layertools -jar target/*.jar extract

# Stage 3: Production runtime
FROM eclipse-temurin:17-jre-alpine AS production
WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Install curl for healthchecks
RUN apk add --no-cache curl

# Copy layers from build stage
COPY --from=build /build/dependencies/ ./
COPY --from=build /build/spring-boot-loader/ ./
COPY --from=build /build/snapshot-dependencies/ ./
COPY --from=build /build/application/ ./

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R spring:spring /app

# Switch to non-root user
USER spring:spring

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# Use optimized JVM flags for containers
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]