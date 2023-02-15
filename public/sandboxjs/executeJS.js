//Adds an uncaughtException listener onto the vm to handle vm exceptions
function registerListeners() {
    vm.addListener('uncaughtException', _uncaughtException);
}

//Removes the uncaughtException listener from vm
function cleanup() {
    vm.removeListener('uncaughtException', _uncaughtException);
}

//Function to handle uncaughtException of vm
function _uncaughtException(err) {
    console.error('Asynchronous error caught.', err);
}

/* Function which is called to execute user injected JS code
 * code: String - User typed JS code is passed as a string
 * context: Object - The object on which the code performs transformations
 * Returns updated context or error
 */
const executeJS = (code, context) => {
    //Using Promise to convert callback based call to async call
    return new Promise((resolve, reject) => {
        //Enclosing user typed code with skeleton code for better control
        //So we get JS function in string format with user's code at the core
        const func = `module.exports = function (context, resolve, reject) {
            try{
                ${code}
                resolve(context);
            } catch(ex) {
                reject(ex);
            }
        }`;
        // Add listener to catch errors
        registerListeners();
        //vm.run converts the string formated function to JS function with callback 
        //which when called will execute the code inside sandbox i.e. sandboxedFunction
        let sandboxedFunction = vm.run(func);
        //Pass the context to sandboxedFunction and the callback functions
        //to handle success and error cases
        sandboxedFunction(context, (ctx) => {
            cleanup();
            resolve(ctx);
        }, (error) => {
            cleanup();
            reject(error);
        });
    });
}