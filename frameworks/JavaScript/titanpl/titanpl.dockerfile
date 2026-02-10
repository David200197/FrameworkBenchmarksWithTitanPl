# Build stage
FROM rust:latest AS builder

# Install Node.js for Titan CLI
RUN apt-get update && apt-get install -y \
    curl \
    pkg-config \
    libssl-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /titanpl

# Install Titan CLI globally
RUN npm install -g @ezetgalaxy/titan

# Copy project files
COPY . .

# Install project dependencies (esbuild, etc)
RUN npm install

# Build the project
RUN titan build --release

# Runtime stage - Ubuntu 24.04 has GLIBC 2.39 (required by precompiled libtitan_core.so)
FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3t64 \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Titan CLI
RUN npm install -g @ezetgalaxy/titan

WORKDIR /titanpl

# Copy the entire built project
COPY --from=builder /titanpl /titanpl

ENV TITAN_BENCHMARK=1
ENV MIMALLOC_LARGE_OS_PAGES=1

EXPOSE 8080

CMD ["titan", "start"]