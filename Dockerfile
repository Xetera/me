ARG BASE=node:22-slim

FROM ${BASE} AS dependencies

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --unsafe-perm

FROM ${BASE} AS builder

RUN apt-get update -y && apt-get install -y curl openssl
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY --from=dependencies /app/node_modules ./node_modules

COPY prisma ./prisma

COPY . .
RUN pnpm build
RUN pnpm generate
RUN pnpm prune --prod \
  # Clean Prisma non-used files https://github.com/prisma/prisma/issues/11577
  && rm -rf node_modules/.cache/ \
  && rm -rf node_modules/.pnpm/@prisma+engines* \
  && rm -rf node_modules/.pnpm/esbuild* \
  && rm -rf node_modules/.pnpm/@esbuild+linux* \
  && rm -rf node_modules/.pnpm/typescript* \
  # Remove cache
  && rm -rf /root/.cache/ \
  && rm -rf /root/.npm/

FROM ${BASE} AS runner

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

USER node

ENV FASTIFY_HOST="0.0.0.0"
EXPOSE 3000

CMD [ "node", "-r", "./dist/telemetry.js", "./dist/index.js" ]
