# ---- DEV
FROM node:14.17.3 as base
EXPOSE 4500
ENV PORT=4500

WORKDIR /app

# ---- TEST 
# Reference: https://playwright.dev/docs/docker
FROM mcr.microsoft.com/playwright:v1.22.0-focal as test

WORKDIR /app
COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
RUN yarn

COPY . /app
RUN npx playwright install --with-deps

# --- PROD
FROM base as build
ARG serverurl

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
RUN yarn

ENV VITE_SERVER_URL=$serverurl
COPY . /app
RUN yarn build

FROM nginx:stable-alpine as prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
