FROM node:20

WORKDIR /usr/src/app

COPY ./package.json ./
RUN npm install

COPY ./index.js ./
COPY ./wait-for-it.sh ./
RUN chmod +x wait-for-it.sh

EXPOSE 3001

CMD ["./wait-for-it.sh", "db:3306", "--", "node", "index.js"]