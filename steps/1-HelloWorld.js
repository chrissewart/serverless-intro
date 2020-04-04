/* This is about the simplest Javascript function I can write. 
   Let's get it running as an AWS Lambda Function */

exports.sayHello = async () => `Hello World`;

/* Note: Older Javascript eqivalent:

export function sayHello(event, context, callback) {
  callback(null, 'Hello World')
}

*/


/*  Deploy and Run
awsAccount=$(aws sts get-caller-identity --output text --query 'Account')

# Allow AWS Lambda to become this role
aws iam create-role --role-name basic_lambda_role --assume-role-policy-document file://basic-lambda-role.json

# Create a deployment package. This is simply a zip file. 
cp 1-HelloWorld.js entrypoint.js
zip todeploy entrypoint.js

# Create a lambda 
aws lambda create-function --zip-file fileb://todeploy.zip \
  --function-name helloworld \
  --handler entrypoint.sayHello \
  --runtime nodejs12.x \
  --role arn:aws:iam::$awsAccount:role/basic_lambda_role

# Run it
aws lambda invoke --function-name helloworld out.txt  

cat out.txt
*/