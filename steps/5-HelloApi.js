/* Let's try something a bit more useful: 
   A function that can be called from the web. 
*/

// It is good practice to separate your domain logic from technology
// specific interfaces. Here's our simple core logic: Something that
// returns an object with a property 'msg'.
const importantBusinessLogic = (person) => {
    return {
        msg: `Hello ${person}`
    }
}

// Here's the AWS Lambda specific interface for HTTP APIs
exports.handler = async (event) => {

    // Get input from the request. We'll use the query string
    const person = event.queryStringParameters && event.queryStringParameters.person

    if (!person)
        return { statusCode: 401, body: 'Missing query string parameter: person'}

    // Run our domain specific logic. 
    const result = importantBusinessLogic(person)
    
    // API Gateway assumes JSON ContentType and 200 status.
    return result
}

/* Deploy & Run

# Get our accountId from AWS
awsAccount=$(aws sts get-caller-identity --output text --query 'Account')

# IF you've not done the previous steps, create a role that allows our Lambda to be invoked.  
aws iam create-role --role-name basic_lambda_role \
  --assume-role-policy-document file://basic-lambda-role.json

# Allow our Lambda role permission to log to CloudWatch logs
aws iam attach-role-policy --role-name basic_lambda_role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
  
# Deploy our code
cp 5-HelloApi.js entrypoint.js && zip todeploy entrypoint.js

aws lambda create-function --zip-file fileb://todeploy.zip \
  --function-name helloapi \
  --handler entrypoint.handler \
  --runtime nodejs12.x \
  --role arn:aws:iam::$awsAccount:role/basic_lambda_role

# Create the API Gateway that will invoke our function
aws apigatewayv2 create-api --name helloapi --protocol-type HTTP \
  --target arn:aws:lambda:eu-west-1:$awsAccount:function:helloapi

apiId=$(aws apigatewayv2 get-apis |jq -r '.Items[] | select(.Name == "helloapi") | .ApiId')

# Allow the API Gateway to call our Lambda Function
aws lambda add-permission \
  --function-name helloapi \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --statement-id helloapi-dev \
  --source-arn "arn:aws:execute-api:eu-west-1:$awsAccount:$apiId/*"  


# Try accessing it
curl https://$apiId.execute-api.eu-west-1.amazonaws.com/?person=Fred

curl https://$apiId.execute-api.eu-west-1.amazonaws.com/foo/bar/?person=Fred

curl https://$apiId.execute-api.eu-west-1.amazonaws.com/
*/