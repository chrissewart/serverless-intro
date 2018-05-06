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

    // Get input from the event. In this case the query string. 
    const person = event.queryStringParameters.person;

    // Run our domain specific logic. 
    const result = importantBusinessLogic(person)
 
    // Create a response object. AWS Lambda is expecting a statusCode at least.
    // We'll add a body and a header to make it more interesting. 
    const apiResponse = {
        statusCode: 200,
        headers: { "x-custom-header" : "my custom header value" },
        body: JSON.stringify(result)
    }
    
    return apiResponse;
}

/* Deploy using 5-HelloApi.sh */