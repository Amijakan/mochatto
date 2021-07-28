FROM node:14.17.3

# Do environmental setup here

# Installing node modules
COPY . /
RUN yarn

EXPOSE 4000
ENTRYPOINT ["yarn", "start"]


