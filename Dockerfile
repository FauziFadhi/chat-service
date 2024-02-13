from node:20.11.0-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${PORT}

RUN npm run build

CMD ["node", "dist/src/main.js"]
