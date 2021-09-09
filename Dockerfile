FROM node:16.8.0-bullseye-slim AS builder

RUN apt-get update && \
    apt-get install zip awscli -y

COPY . /src
WORKDIR /src

RUN npm install && \
    npm run build && \
    npm run zip:build

ENTRYPOINT [ "/bin/bash" ]

# Based off the aws-cli that way we can more easily use this container to upload the zip
FROM amazon/aws-cli:2.1.32

COPY --from=builder /src/lambda.zip /root/lambda.zip
