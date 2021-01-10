FROM node:12.7-alpine AS build
WORKDIR /usr/src/app
#COPY package.json package-lock.json ./
#RUN npm install
COPY . .
#RUN npm run build --prod

FROM nginx:latest

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist/dnipro-alp-pro /var/www/angular-deploy
