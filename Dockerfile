ARG BASE=node:20.15-slim

FROM ${BASE} as dependencies

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --unsafe-perm

FROM ${BASE} as builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY --from=dependencies /app/node_modules ./node_modules

COPY prisma ./primsa

COPY . .
RUN pnpm build
RUN pnpm generate

RUN pnpm prune --prod

USER node

CMD [ "node", "./dist/index.js" ]
