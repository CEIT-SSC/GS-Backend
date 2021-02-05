FROM node:15.8.0-alpine3.10
RUN apk update && apk add --no-cache python3 py3-pip
RUN apk add bash
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package.json ./
RUN npm install
RUN npm install -g pm2
COPY . ./
EXPOSE 5000
CMD ["pm2-runtime" , "index.js"]
