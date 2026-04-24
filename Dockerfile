FROM node:20-alpine

RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD ["node", "src/index.js"]
