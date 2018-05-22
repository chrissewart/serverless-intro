# Bash is OK for playing around, but you need a way to delete everything
# you've made to keep things reproducible.  Terraform is one such way.

# It's a bit crap in that it doesn't query the state of your AWS account, 
# but instead makes a local cache of the /bits/ of the account that a
# particular Terraform script affects and uses this to work out what to do.
# You've now got a cache invalidation problem, which alongside naming things
# and off-by-one errors is one of the top headaches in programming. 

# The upshot is if you do anything outside of this Terraform script to 
# things it is dealing with, it'll go wrong. 

provider "aws" {
  region = "eu-west-1"
}

#
# Add Lambda and role
#
resource "aws_lambda_function" "helloapitf" {
  function_name = "helloapitf"
  filename = "todeploy.zip"
  handler = "entrypoint.handler"
  runtime = "nodejs8.10"
  role = "${aws_iam_role.lambda_exec.arn}"
  source_code_hash = "${base64sha256(file("todeploy.zip"))}"
}

resource "aws_iam_role" "lambda_exec" {
  name = "basic_lambda_role_tf"
  assume_role_policy = <<EOF
{
	"Version": "2012-10-17",
	"Statement": {
  		"Effect": "Allow",
  		"Principal": {
    		"Service": "lambda.amazonaws.com"
  		},
  		"Action": "sts:AssumeRole"
	}
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role = "${aws_iam_role.lambda_exec.name}"
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


#
#  Add the API to the gateway. You need
#  - An "API": a hook for all the other things
#  - Resources: e.g /foo in this case a wildcard specified by {proxy+} These have:
#    - Methods: POST/GET etc.  ANY for now.
#    - An "integration". What handles /foo upstream? In this case a Lambda
#  - Deployments "deployment".  e.g. dev/test/prod 
resource "aws_api_gateway_rest_api" "helloapitf" {
  name        = "helloapitf"
  description = "A simple example" 
}

resource "aws_api_gateway_resource" "proxy" {
  rest_api_id = "${aws_api_gateway_rest_api.helloapitf.id}"
  parent_id   = "${aws_api_gateway_rest_api.helloapitf.root_resource_id}"
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  rest_api_id   = "${aws_api_gateway_rest_api.helloapitf.id}"
  resource_id   = "${aws_api_gateway_resource.proxy.id}"
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
  rest_api_id = "${aws_api_gateway_rest_api.helloapitf.id}"
  resource_id = "${aws_api_gateway_method.proxy.resource_id}"
  http_method = "${aws_api_gateway_method.proxy.http_method}"

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.helloapitf.invoke_arn}"
}

resource "aws_api_gateway_deployment" "helloapitf" {
  depends_on  = ["aws_api_gateway_integration.lambda"]
  rest_api_id = "${aws_api_gateway_rest_api.helloapitf.id}"
  stage_name  = "dev"
}

# Need to allow APIG to call helloapitf Lambda
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.helloapitf.arn}"
  principal     = "apigateway.amazonaws.com"
  source_arn = "${aws_api_gateway_deployment.helloapitf.execution_arn}/*/*"
}

# Print out the URL 
output "base_url" {
  value = "${aws_api_gateway_deployment.helloapitf.invoke_url}"
}

# Now run it.  Terraform is just a single executable. Install it however you want.
#cp 5-HelloApi.js entrypoint.js && zip todeploy entrypoint.js

# Build the local cache: 
# terraform init

# See what it would do:
# terraform plan

# Create everything:
# terraform apply

# Curl the URL given above adding /helloapi?person=Sue

# Now delete everything
# terraform destroy 