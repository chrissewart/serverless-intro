// Let's investigate logging and discover a bit about statefulness 
console.log('Entrypoint initialising')
let count = 1;

exports.sayHello = async (event) => {
    console.log('Handler Running')
    return `Hello Logs ${count++}`    
}

/*  Update and Run

cp 3-HelloLogs.js entrypoint.js && zip todeploy entrypoint.js

aws lambda update-function-code --zip-file fileb://todeploy.zip --function-name helloworld 

aws lambda invoke --function-name helloworld out.txt  && cat out.txt

# Tail the log that the command line fetched. 
aws lambda invoke --function-name helloworld out.txt --log-type Tail

# ...and decode it.  We'll use jq to pluck out LogResult property from the JSON.
# You'll see the function's log output. 
# You'll also see how long it took to run - and how long you were billed for. 
aws lambda invoke --function-name helloworld out.txt --log-type Tail | jq -r .LogResult | base64 -d

# Allow logging to cloudwatch
aws iam attach-role-policy \
  --role-name basic_lambda_role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# The container needs to be restarted to pick up the role change. This is one way:
aws lambda delete-function --function-name helloworld
aws lambda create-function --zip-file fileb://todeploy.zip --function-name helloworld --handler entrypoint.sayHello --runtime nodejs12.x --role arn:aws:iam::$awsAccount:role/basic_lambda_role

# Invoke it and cat the output.  It seems to get a bit slower now we've added Cloudwatch logging. 
aws lambda invoke --function-name helloworld out.txt  && cat out.txt



# Now look at Cloudwatch logs https://eu-west-1.console.aws.amazon.com/cloudwatch/home?region=eu-west-1#logs: 
# OR use the command line: 
aws logs describe-log-groups
aws logs describe-log-streams --log-group-name /aws/lambda/helloworld
latestStream=`aws logs describe-log-streams --log-group-name /aws/lambda/helloworld | jq -r .logStreams[length-1].logStreamName`
aws logs get-log-events --log-group-name /aws/lambda/helloworld --log-stream-name $latestStream |jq -r ".events[].message"

# Try running it a few more times. Note the counter going up. 
# This is important. There are two lifeycles: 1) The /Container/ 2) The /Function/ 
# Variables (like our counter) declared outside of the Function (handler)
# hang around for the duration of the Container lifetime. This is however 
# long AWS decides to keep your container warm for. 
# Anything declared inside the function is initialised on every request. 
# It is usually a good idea to declare everything inside the function - you can't 
# rely on how long a Container will hang around for. 

*/
 
