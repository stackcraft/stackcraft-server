# ------------------------------------------------------------------------------
# Dockerfile to build Docker Image of Node.js webserver
# ------------------------------------------------------------------------------

FROM node:12.2.0-alpine

RUN apt-get update && apt-get install -y curl apt-transport-https && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && apt-get install -y yarn

COPY package.json package.json
RUN yarn install --production

# Open port

EXPOSE 3000

# Add your source files

COPY . .
CMD ["yarn", "start"]
