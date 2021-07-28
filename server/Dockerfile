FROM node:14.17.3
EXPOSE 4000

# Do environmental setup here
# Installing node modules
WORKDIR /app
RUN yarn

ENTRYPOINT ["yarn", "dev"]


