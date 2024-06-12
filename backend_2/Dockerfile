FROM node:18.18-alpine

RUN apk add syslog-ng
RUN npm i -g @nestjs/cli

WORKDIR /services/app
COPY "package*.json" ./
RUN npm i
COPY . .

RUN mkdir -p /var/log/syslog-ng

COPY syslog-ng.conf /etc/syslog-ng/syslog-ng.conf

EXPOSE 3000

CMD ["sh", "-c", "syslog-ng -F & npm run start:dev"]