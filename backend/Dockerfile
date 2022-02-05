FROM node:16-alpine3.12

RUN mkdir /src

# RUN yarn add nodemon -g

WORKDIR /src
ADD ./package.json /src/package.json
RUN yarn

# Bundle app source
COPY . .

EXPOSE 8080

CMD yarn dev