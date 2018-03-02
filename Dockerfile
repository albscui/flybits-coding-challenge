FROM node:latest
RUN mkdir -p /usr/src/flybitscoffee
WORKDIR /usr/src/flybitscoffee
COPY package*.json /usr/src/flybitscoffee/
RUN npm install
COPY . /usr/src/flybitscoffee/
EXPOSE 3000
CMD ["npm", "start"]