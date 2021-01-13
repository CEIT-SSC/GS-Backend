FROM node:latest
RUN mkdir -p /home/node/app
RUN npm install -g pm2
WORKDIR /home/node/app
COPY package.json ./
RUN npm install
COPY . ./
EXPOSE 3000
CMD ["pm2" , "start" , "index.js"]