FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
