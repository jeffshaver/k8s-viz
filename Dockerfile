FROM mhart/alpine-node:7.8.0

MAINTAINER jeff_e_shaver

ENV NODE_ENV production

ARG PORT=3000

ENV PORT ${PORT}

WORKDIR /opt/app

COPY package.json /opt/app/package.json
RUN npm install \
  && rm -rf \
    /root/.npm \
    /tmp/npm

COPY server/package.json /opt/app/server/package.json

WORKDIR /opt/app/server

RUN npm install \
  && rm -rf \
    /root/.npm \
    /tmp/npm

WORKDIR /opt/app

COPY . /opt/app/

RUN npm run build \
  && rm -rf \
    /opt/app/node_modules

WORKDIR /opt/app/server

EXPOSE $PORT
CMD ["node", "index.js"]