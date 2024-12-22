FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

COPY . .

RUN npm ci
RUN npm run build

CMD ["npm", "start"]

EXPOSE 3000