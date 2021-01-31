FROM node:latest
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package.json ./
RUN npm install
RUN npm install -g pm2
COPY . ./
EXPOSE 5000
CMD ["pm2-runtime" , "index.js"]