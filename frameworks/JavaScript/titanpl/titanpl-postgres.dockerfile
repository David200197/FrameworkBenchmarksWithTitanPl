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

RUN npm install

RUN titan build --release

# Runtime stage - Ubuntu 24.04 has GLIBC 2.39 (required by precompiled libtitan_core.so)
FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3t64 \
    libpq5 \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Titan CLI
RUN npm install -g @ezetgalaxy/titan

WORKDIR /titanpl

# Copy the entire built project
COPY --from=builder /titanpl /titanpl

# TechEmpower database connection
ENV DATABASE_URL="postgresql://benchmarkdbuser:benchmarkdbpass@tfb-database:5432/hello_world"

EXPOSE 8080

CMD ["titan", "start"]
