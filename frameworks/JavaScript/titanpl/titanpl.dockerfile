# Build stage
FROM rust:1.76-slim-bookworm AS builder

# Install Node.js for Titan CLI
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /titanpl

# Install Titan CLI globally
RUN npm install -g @ezetgalaxy/titan

# Copy project files
COPY . .

# Initialize and build the project
RUN titan build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the compiled binary from builder
COPY --from=builder /titanpl/dist/server /app/server

# Expose the port
EXPOSE 3000

# Run the server
CMD ["./server"]
