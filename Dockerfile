FROM node:8.9.0-wheezy

ARG npm_token
ARG node_env

ENV NPM_TOKEN $npm_token
ENV APP_DIR /var/app
ENV PORT 3000

RUN mkdir -p $APP_DIR
WORKDIR $APP_DIR

COPY ./package.json $APP_DIR
RUN printf "//registry.npmjs.org/:_authToken=${NPM_TOKEN}\n" > ~/.npmrc && \
    npm i --loglevel warn

COPY . $APP_DIR

RUN ./node_modules/.bin/gulp 
RUN rm -rf $APP_DIR/bin

EXPOSE $PORT
CMD ["npm", "start"]