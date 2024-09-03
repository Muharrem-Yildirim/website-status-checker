FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm run build

COPY . .

CMD ["npm", "start"]

EXPOSE 3000