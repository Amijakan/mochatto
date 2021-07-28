FROM node:14.17.3
EXPOSE 4500
ENV PORT=4500

COPY . /

RUN yarn && yarn build

ENTRYPOINT ["yarn", "serve"]
