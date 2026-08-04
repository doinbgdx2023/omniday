FROM node:22-slim

WORKDIR /app

COPY package.json ./
RUN corepack enable && pnpm approve-builds && pnpm install --no-frozen-lockfile

COPY . .

RUN pnpm run build

CMD ["pnpm", "start"]
