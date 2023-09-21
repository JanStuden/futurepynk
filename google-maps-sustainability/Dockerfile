# https://cli.vuejs.org/guide/deployment.html#docker-nginx
FROM nginx:mainline-alpine
RUN mkdir /app
# Copy files/folders in layers so the docker laye caching feature can be used
# COPY ./dist/js /app
COPY ./dist/fonts /app/fonts
COPY ./dist/pdf-worker /app/pdf-worker
COPY ./dist/favicon.ico /app/favicon.ico
COPY ./dist/robots.txt /app/robots.txt
COPY ./dist/manifest.json /app/manifest.json
COPY ./dist/pdf /app/pdf
COPY ./dist/xlsx /app/xlsx
COPY ./dist/img /app/img
# COPY ./dist/avatar-img /app/avatar-img
COPY ./dist/sound /app/sound
COPY ./dist/css /app/css
COPY ./dist/js /app/js
COPY ./dist/precache-manifest /app/precache-manifest
COPY ./dist/service-worker.js /app/service-worker.js
COPY ./dist/index.html /app/index.html
COPY nginx.conf /etc/nginx/nginx.conf