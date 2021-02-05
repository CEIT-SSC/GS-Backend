FROM node:latest
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY package.json ./
RUN npm install
RUN npm install -g pm2
RUN apt update
RUN apt install software-properties-common -y
RUN add-apt-repository ppa:deadsnakes/ppa -y
RUN apt-get install python3.8 -y
COPY . ./
EXPOSE 5000
CMD ["pm2-runtime" , "index.js"]
