FROM node:22-slim

WORKDIR /app

COPY package.json ./
RUN corepack enable && pnpm install

COPY . .

RUN pnpm run build

CMD ["pnpm", "start"]
