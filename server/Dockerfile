# Base
FROM node:14.17.3 as base
EXPOSE 4000

WORKDIR /app

# Prod
FROM base as prod

COPY . /app
RUN yarn
