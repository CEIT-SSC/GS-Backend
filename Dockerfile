FROM node:latest
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package.json ./
RUN npm install
RUN npm install -g pm2
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-get install python3.8
COPY . ./
EXPOSE 5000
CMD ["pm2-runtime" , "index.js"]
