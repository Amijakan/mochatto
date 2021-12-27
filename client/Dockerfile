# ---- DEV
FROM node:14.17.3 as base
EXPOSE 4500
ENV PORT=4500

WORKDIR /app

# --- PROD
FROM base as prod
ARG serverurl
RUN echo "$serverurl"
ENV REACT_APP_SERVER_URL=$serverurl
COPY . /app
RUN yarn && yarn build

