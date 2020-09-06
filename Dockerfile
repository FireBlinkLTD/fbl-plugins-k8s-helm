FROM fireblink/kind:1.19.0-2

RUN npm i -g http-server

# copy static files
WORKDIR /usr/app

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install

COPY . .
RUN yarn build

RUN chmod +x docker-run-tests.sh

ENTRYPOINT ["/usr/app/docker-run-tests.sh"]
