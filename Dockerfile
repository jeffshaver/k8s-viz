FROM mhart/alpine-node:8.6.0

MAINTAINER jeff_e_shaver

ENV NODE_ENV production

ARG PORT=3000

ENV PORT ${PORT}

WORKDIR /opt/app/client

COPY client/package.json /opt/app/client/package.json
COPY client/package-lock.json /opt/app/client/package-lock.json

RUN npm install \
  && rm -rf \
    /root/.npm \
    /tmp/npm

WORKDIR /opt/app/server

COPY server/package.json /opt/app/server/package.json
COPY server/package-lock.json /opt/app/server/package-lock.json

RUN npm install \
  && rm -rf \
    /root/.npm \
    /tmp/npm

WORKDIR /opt/app/client

COPY client/. /opt/app/client/.

RUN npm run build \
  && rm -rf \
  /opt/app/client/node_modules

WORKDIR /opt/app/server

COPY server/. /opt/app/server/.

EXPOSE $PORT
CMD ["node", "index.js"]
