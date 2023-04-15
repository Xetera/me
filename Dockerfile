
ARG BASE=node:18.13-slim
FROM ${BASE} as dependencies

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
# ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --unsafe-perm
# RUN pnpm install --frozen-lockfile --unsafe-perm

FROM ${BASE} as builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate

RUN pnpm typegen
RUN pnpm build

RUN pnpm prune --prod

CMD [ "node", "./dist/index.js" ]

# FROM ${BASE} as prod

# WORKDIR /app

# # RUN apk update && apk upgrade --no-cache
# RUN apt-get update && apt-get -y upgrade

# RUN corepack enable && corepack prepare pnpm@latest --activate

# COPY package.json pnpm-lock.yaml ./

# RUN pnpm install --frozen-lockfile --unsafe-perm

# COPY prisma ./prisma
# RUN pnpm exec prisma generate

# COPY . .
# RUN pnpm typegen

# RUN pnpm build
# # RUN ls -lsa /app/node_modules/.pnpm/cycletls@1.0.21/node_modules/cycletls/dist
# # USER node

# # config.toml should be mounted as a volume

# CMD [ "node", "./dist/index.js" ]
# # CMD [ "pnpm", "exec", "tsx", "./src/index.ts" ]
# #CMD [ "pnpm", "dev" ]
