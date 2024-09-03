FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm run deploy

COPY . .

CMD ["npm", "start"]

EXPOSE 3000