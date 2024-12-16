FROM node:18-alpine3.14
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "start"]
EXPOSE 9000
