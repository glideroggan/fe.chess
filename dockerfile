FROM node:16 as build
WORKDIR /usr/src/app
COPY ./package.json ./yarn.lock ./
RUN yarn install

COPY ./. .
COPY ./src/assets ./dist/assets
RUN yarn build

FROM nginx:alpine-slim
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80