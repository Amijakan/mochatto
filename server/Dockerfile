# Base
FROM node:16.15.0 as base
EXPOSE 4000

WORKDIR /app

# Prod
FROM base as prod

COPY . /app
RUN yarn
