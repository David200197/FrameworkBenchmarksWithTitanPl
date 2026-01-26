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

# Initialize and build the project
RUN titan build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the compiled binary from builder
COPY --from=builder /titanpl/dist/server /app/server

# Expose the port
EXPOSE 8080

# Run the server
CMD ["./server"]
