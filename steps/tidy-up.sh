# Let's try and undo all the steps
terraform destroy ;#step 6
aws logs delete-log-group --log-group-name /aws/lambda/helloapitf

# step 5
apiId=$(aws apigatewayv2 get-apis |jq -r '.Items[] | select(.Name == "helloapi") | .ApiId')
aws apigatewayv2 delete-api --api-id $apiId
aws lambda delete-function --function-name helloapi
aws logs delete-log-group --log-group-name /aws/lambda/helloapi

# steps 1-4
aws lambda delete-function --function-name helloworld
aws logs delete-log-group --log-group-name /aws/lambda/helloworld

aws iam detach-role-policy \
  --role-name basic_lambda_role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam delete-role --role-name basic_lambda_role

