FROM node:18.18-alpine

RUN npm i -g @nestjs/cli

WORKDIR /services/app
COPY "package*.json" ./
RUN npm i

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]