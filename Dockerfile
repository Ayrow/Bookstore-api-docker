FROM node:16-alpine

COPY package-lock.json package.json ./
RUN npm install

CMD [ "npm", "run", "dev" ]
