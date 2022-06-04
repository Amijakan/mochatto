# ---- DEV
FROM node:14.17.3 as base
EXPOSE 4500
ENV PORT=4500

WORKDIR /app

# --- PROD
FROM base as build
ARG serverurl

COPY ./package.json /app/package.json
COPY ./yarn.lock /app/yarn.lock
RUN yarn --frozen-lockfile

ENV VITE_SERVER_URL=$serverurl
COPY . /app
RUN yarn build

FROM nginx:stable-alpine as prod
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
