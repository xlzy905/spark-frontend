FROM node:20 AS build-env
WORKDIR /app
COPY . .

RUN npm i -g pnpm@9
RUN pnpm install
RUN pnpm run build

FROM nginx
COPY --from=build-env /app/build /usr/share/nginx/html

EXPOSE 80