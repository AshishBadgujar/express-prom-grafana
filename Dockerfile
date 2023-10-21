FROM node:alpine

WORKDIR /app

COPY package.json .

COPY package-lock.json .

RUN npm install

COPY main.js .

EXPOSE 5000

CMD [ "node","main.js" ]