/* The previous example talked about a "Container" for the Function.
   It turns out that Lambdas are (currently) run inside Linux Containers.
   Let's dig around inside it.  Here's a function that runs any Bash
   command you give it.
*/
const { execSync } = require('child_process');

exports.sayHello = async (event) => execSync(event.cmd).toString();


/*  Update and Run

cp 4-HelloContainer.js entrypoint.js && zip todeploy entrypoint.js

aws lambda update-function-code --zip-file fileb://todeploy.zip --function-name helloworld 

# Invoke it with 'ls'. You should see your unziped code 'entrypoint.js'
aws lambda invoke --function-name helloworld out.txt  --payload '{"cmd":"ls"}' && cat out.txt | jq -r .

# Some more things to try in place of 'ls'
# Where are we? pwd
# What OS is this? cat /etc/*-release
# What packages do we have? rpm -qa
# What's running? ps -elf
# Something is wrapping our handler, what? cat /var/runtime/node_modules/awslambda/index.js
# How long has this container been running? uptime
*/

