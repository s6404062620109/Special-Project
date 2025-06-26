FROM node:18

RUN apt-get update && \
    apt-get install -y docker.io && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production  # Use --production to avoid devDependencies if not needed

COPY index.js ./
COPY .env ./
COPY wait-for-it.sh ./
COPY routes/ ./routes/

# Make the wait-for-it.sh script executable
RUN chmod +x wait-for-it.sh

EXPOSE 3001

CMD ["./wait-for-it.sh", "db:3306", "--", "node", "index.js"]
