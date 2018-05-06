# Making the function reachable via the web requires an API Gateway. 
# API Gateways can do a lot of things and so require quite a few concepts
# just for a simple example.  If you use the AWS Console, most of this
# magic is done in the background, but our aim is to understand what is 
# going on...so we do it the hard way. 

# It is worth reading the output of each command to get an idea of
# what is going on. Some commands generate IDs that we need later so
# there is a bit of jq hackery to fetch them out after the creation.

# Allow our Lambda role permission to log to CloudWatch (this will be useful later)
aws iam attach-role-policy \
  --role-name basic_lambda_role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Get our accountId from AWS
awsAccount=$(aws sts get-caller-identity --output text --query 'Account')
  
# Deploy our code
cp 5-HelloApi.js entrypoint.js && zip todeploy entrypoint.js

aws lambda create-function --zip-file fileb://todeploy.zip \
  --function-name helloapi \
  --handler entrypoint.handler \
  --runtime nodejs8.10 \
  --role arn:aws:iam::$awsAccount:role/basic_lambda_role

lambdaArn=arn:aws:lambda:eu-west-1:$awsAccount:function:helloapi

# You don't create a "Gateway" You create a "REST APIs" on the Gatway service.
aws apigateway create-rest-api --name helloapi

# Store the API ID and the root "/" id 
apiId=$(aws apigateway get-rest-apis |jq -r '.items[] | select(.name == "helloapi") | .id')
rootId=$(aws apigateway get-resources --rest-api-id $apiId | jq -r .items[0].id)

# Create a 'resource' (e.g. /foo). In this case a general purpose proxy (/*)
aws apigateway create-resource --rest-api-id $apiId --parent-id $rootId --path-part {proxy+} 

resourceId=$(aws apigateway get-resources --rest-api-id $apiId | jq -r '.items[] | select(.path == "/{proxy+}") | .id')

# Say what HTTP methods (GET, POST, etc) we can have on this resource (ANY for now)
aws apigateway put-method --rest-api-id $apiId --resource-id $resourceId \
  --http-method ANY \
  --authorization-type NONE

# Integrate the Gateway REST API with our Lambda function 
aws apigateway put-integration --rest-api-id $apiId --resource-id $resourceId \
  --http-method ANY \
  --type AWS_PROXY \
  --integration-http-method POST \
  --uri arn:aws:apigateway:eu-west-1:lambda:path/2015-03-31/functions/$lambdaArn/invocations 

# Create a deployment stage (an environment like dev, test or prod)
aws apigateway create-deployment --rest-api-id $apiId \
  --stage-name dev \
  --stage-description 'Development Stage' \
  --description 'First deployment to the dev stage'

# Allow the API Gateway to call our Lambda Function
aws lambda add-permission \
  --function-name helloapi \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --statement-id helloapi-dev \
  --source-arn "arn:aws:execute-api:eu-west-1:$awsAccount:$apiId/*"  

# Try accessing it
curl https://$apiId.execute-api.eu-west-1.amazonaws.com/dev/helloapi?person=Fred

curl https://$apiId.execute-api.eu-west-1.amazonaws.com/dev/helloapi/foo/bar?person=Fred
