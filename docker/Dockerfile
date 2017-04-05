FROM mhart/alpine-node:7.8.0

MAINTAINER jeff_e_shaver

# install curl and git
RUN apk add --no-cache git \
  && git clone https://github.com/jeffshaver/mp-viz -b master --single-branch \
  && apk del git

ENV NODE_ENV production

RUN mkdir -p /opt/app
WORKDIR /opt/app

RUN cp /mp-viz/package.json /opt/app/package.json

ARG PORT=3000
ENV PORT ${PORT}

RUN NODE_ENV=development npm install \
  && cp -R /mp-viz/. /opt/app/ \
  && npm run build \
  && rm -rf \
    /mp-viz \
    /opt/app/node_modules \
    /opt/app/yarn.lock \
  && rm -rf \
  /root/.npm \
  /tmp/npm*

WORKDIR /opt/app/server

RUN npm install \
  && rm -rf \
  /root/.npm \
  /tmp/npm*


EXPOSE $PORT
CMD ["node", "index.js"]
