FROM node:latest
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package.json ./
RUN npm install
RUN npm install -g pm2
RUN apk add python3
RUN apk add py3-pip
COPY . ./
EXPOSE 5000
CMD ["pm2-runtime" , "index.js"]