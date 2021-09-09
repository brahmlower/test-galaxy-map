#!/usr/bin/env bash

npm run build

rm -f ./lambda.zip

zip -vjr ./lambda.zip ./lambda.js ./dist/generator.js

aws --endpoint http://localhost:4566 lambda delete-function \
    --function-name galaxy-generator

aws --endpoint http://localhost:4566 lambda create-function \
    --zip-file fileb://$(pwd)/lambda.zip \
    --function-name galaxy-generator \
    --runtime nodejs12.x \
    --role foo \
    --handler lambda.handler