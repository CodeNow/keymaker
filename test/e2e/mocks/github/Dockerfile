FROM node:0.12

RUN npm install -g easymock

RUN mkdir /var/easymock
WORKDIR /var/easymock
COPY json /var/easymock

EXPOSE 3000

ENTRYPOINT ["easymock"]
