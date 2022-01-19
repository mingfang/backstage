FROM node:14-buster-slim AS build

WORKDIR /app
COPY package.json yarn.lock ./
COPY packages packages
COPY plugins plugins
COPY lerna.json ./
COPY tsconfig.json ./
COPY app-config.yaml ./

RUN yarn install --frozen-lockfile --network-timeout 600000 && rm -rf "$(yarn cache dir)"
RUN yarn tsc
RUN yarn --cwd packages/backend backstage-cli backend:bundle --build-dependencies

FROM node:14-buster-slim as final

WORKDIR /app

COPY --from=build /app/yarn.lock /app/package.json /app/packages/backend/dist/skeleton.tar.gz ./
RUN tar xzf skeleton.tar.gz && rm skeleton.tar.gz

RUN yarn install --frozen-lockfile --production --network-timeout 600000 && rm -rf "$(yarn cache dir)"

# Copy the built packages from the build stage
COPY --from=build /app/packages/backend/dist/bundle.tar.gz .
RUN tar xzf bundle.tar.gz && rm bundle.tar.gz

# Copy any other files that we need at runtime
COPY app-config.yaml ./
ENV NODE_ENV=production

CMD node packages/backend