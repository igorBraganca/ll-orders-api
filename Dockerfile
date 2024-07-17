FROM node:22-alpine as builder

ENV NODE_ENV build

USER node
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY --chown=node:node . .
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine

EXPOSE 3000

ENV NODE_ENV production
ENV DATABASE_HOST db
ENV DATABASE_PORT 3306
ENV DATABASE_USER root
ENV DATABASE_PASS 123456

USER node
WORKDIR /app

COPY --from=builder --chown=node:node /app/package*.json ./
COPY --from=builder --chown=node:node /app/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /app/dist/ ./dist/

RUN rm -f ./dist/database/migrations/*.ts

COPY docker_init.sh ./docker_init.sh

CMD ["sh", "./docker_init.sh"]