FROM node:22-slim

WORKDIR /app

COPY package.json ./
RUN corepack enable && pnpm install --no-frozen-lockfile --ignore-builds

COPY . .

RUN pnpm run build

CMD ["pnpm", "start"]
