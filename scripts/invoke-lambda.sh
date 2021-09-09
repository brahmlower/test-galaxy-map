aws --endpoint http://localhost:4566 lambda invoke \
    --function-name galaxy-generator \
    --log-type none \
    /dev/stdout