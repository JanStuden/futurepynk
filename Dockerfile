FROM node:erbium

# create workdir inside docker image
WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
RUN npm install

# copy over all files, which are not inside the .dockerignore
COPY . /home/node/app

CMD [ "npm", "start"]
