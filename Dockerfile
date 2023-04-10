FROM node:18.13-alpine as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile
RUN pnpm build

FROM alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist 
COPY --from=builder /app/node_modules ./node_modules

CMD [ "node", "./dist/index.js" ]
