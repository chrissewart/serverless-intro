A nuts-and-bolts look at Serverless through AWS. 

There's no frameworks, GUIs, or magic tools. There's plenty of other tutorials for that. We'll do everything by hand to try and get some understanding, dispel some of the myths and reveal that it is not all that different from what you're already doing.

Note: serverless isn't about Functions-as-a-Service. It is about composing applications by gluing together cloud-provider servces - try to not build as much as possible. Eventually I may add integration with other services. 

## You'll need:
- An AWS Account
- The AWS CLI setup
- Node.JS installed 
- Bash, jq, curl and zip (e.g. WSL on Windows)  
- Optionally: Terraform

## Steps
In attempt to build up understanding, we go through numbered steps.  Each step is a file containing the code we're running and the command lines to deploy and run it. 

1. Create a Lambda function and invoke it. 
2. Pass some arguments into the function. How do we receive them?
3. Poke around in the logs to see what's going on (and how we're being billed).
4. Investigate the environment that our function is running in. 
5. More usefully, get our function to handle a HTTP request. 
6. Terraform: an alternative to running all these command lines. 