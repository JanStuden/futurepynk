# https://cli.vuejs.org/guide/deployment.html#docker-nginx
FROM nginx:mainline-alpine
RUN mkdir /app
# Copy files/folders in layers so the docker laye caching feature can be used
# COPY ./dist/js /app
COPY ./dist/ /app/
COPY nginx.conf /etc/nginx/nginx.conf
