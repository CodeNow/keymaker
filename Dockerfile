FROM node:6.10.2

ADD ./package.json /keymaker/package.json
WORKDIR /keymaker

RUN npm install
ADD . /keymaker

CMD npm start
