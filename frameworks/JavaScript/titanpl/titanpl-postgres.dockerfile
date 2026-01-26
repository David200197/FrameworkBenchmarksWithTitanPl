# Build stage
FROM rust:latest AS builder

RUN apt-get update && apt-get install -y \
    curl \
    pkg-config \
    libssl-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /titanpl

RUN npm install -g @ezetgalaxy/titan

COPY . .

# Install project dependencies (esbuild, etc)
RUN npm install

RUN titan build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /titanpl/dist/server /app/server

# TechEmpower database connection
ENV DATABASE_URL="postgresql://benchmarkdbuser:benchmarkdbpass@tfb-database:5432/hello_world"

EXPOSE 8080

CMD ["./server"]
