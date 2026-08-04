FROM node:20-slim

WORKDIR /app

# 安装依赖（利用 pnpm 缓存层）
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# 复制源码
COPY . .

# 构建
RUN pnpm run build

# 启动
CMD ["pnpm", "start"]
