FROM node:10.24.1 as builder
WORKDIR /app

COPY package*.json /app/
COPY internals /app/internals
RUN npm install

COPY . /app
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]