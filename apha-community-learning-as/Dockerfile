FROM node:22-slim

WORKDIR /code

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080

CMD ["npx", "tsx", "src/server.ts"]
