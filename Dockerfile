FROM node:22-slim

WORKDIR /app

# Install build dependencies for native modules (sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy root package files
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev) to build sqlite3 from source
RUN npm install --build-from-source=sqlite3

# Copy frontend package files
COPY frontend/package.json frontend/package-lock.json ./frontend/
COPY frontend/public ./frontend/public
COPY frontend/src ./frontend/src

# Install frontend dependencies and build
RUN cd frontend && npm install && npm run build

# Copy backend source
COPY index.js ./
COPY db/ ./db/

EXPOSE 8080

CMD ["node", "index.js"]
