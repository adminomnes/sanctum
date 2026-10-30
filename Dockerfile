# Node.js 22 LTS with build tools for native SQLite bindings
FROM node:22-bookworm-slim AS base

WORKDIR /app

# Install build dependencies for better-sqlite3 compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

# Ensure data directory exists
RUN mkdir -p data

EXPOSE 10000

ENV NODE_ENV=production
ENV PORT=10000

CMD ["npm", "run", "server:start"]
