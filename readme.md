
# Test Galaxy Map

## Development and testing

Deploy the stack locally in dev mode, then run the task to create the lambda locally, then invoke it locally

```
architect link .
architect deploy -l brahm-testing/lambda-galaxy
architect task -l brahm-testing/lambda-galaxy create-function
architect task -l brahm-testing/lambda-galaxy generate
```


This runs the stack locally but as if it were configured for production. This means we must provide the host override for the lambda host and role. Executing the functions is unchanged.

```
architect deploy -l brahm-testing/lambda-galaxy -p lambda_host=lambda.us-east-2.amazonaws.com -p lambda_role=arn:aws:iam::000000000000:role/lambda-invoke --production
```