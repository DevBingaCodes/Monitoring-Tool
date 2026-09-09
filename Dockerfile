FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && \
    npm cache clean --force

RUN apt-get update \
    && apt-get install -y iproute2 \
    && rm -rf /var/lib/apt/lists/*

RUN apt-get update \
    && apt-get install -y postgresql-common \
    && rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE 3500

CMD ["npm", "start"]