# --- SECTION: Metadata ---
FROM oven/bun:1.2-alpine

LABEL maintainer="Clovis Mugaruka <clovis.mugaruka@gmail.com>"

# Define build-time arguments
ARG PORT=3000

# --- SECTION: App ---
WORKDIR /app

# Copy only what the server needs at runtime
COPY package.json server.js index.html ./
COPY public/ ./public/

# --- SECTION: Execution ---
EXPOSE ${PORT}

CMD ["bun", "run", "server.js"]
