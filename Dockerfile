FROM node:10.24.1 as builder
WORKDIR /app

COPY package*.json /app/
COPY internals /app/internals
RUN npm install --production
RUN mv node_modules node_modules_prod
RUN npm install

COPY . /app
RUN npm run build
RUN rm -rf node_modules
RUN mv node_modules_prod node_modules

FROM node:10.24.1-alpine3.11
WORKDIR /app
COPY --from=builder /app /app

EXPOSE 3000
CMD ["npm", "run", "start:prod"]