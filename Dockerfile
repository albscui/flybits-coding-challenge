FROM node:carbon

# Create app directory and switch to it
RUN mkdir -p /flybitscoffee
WORKDIR /flybitscoffee

# Install app dependencies
COPY package*.json /flybitscoffee/
RUN npm install

# Bundle app source
COPY . /flybitscoffee

EXPOSE 3000
CMD ["npm", "start"]