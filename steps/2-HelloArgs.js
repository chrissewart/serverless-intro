// Slightly more useful example: Let's read some input this time. 
exports.sayHello = async (event) => `Hello ${event.person}`;


/*  Update and Run

cp 2-HelloArgs.js entrypoint.js && zip todeploy entrypoint.js

aws lambda update-function-code --zip-file fileb://todeploy.zip --function-name helloworld 

aws lambda invoke --function-name helloworld out.txt --payload '{"person":"chris"}' 

cat out.txt
*/