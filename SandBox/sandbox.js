const { PythonShell } = require("python-shell");
const fs = require("fs");

function savePythonFile(input) {
  const filename = "SandBox/UserPythonScripts/tester.py";
  const content = input;

  fs.writeFile(filename, content, (err) => {
    if (err) throw err;
    console.log("The file has been saved!");
  });
}

exports.pythonSandbox = async (req, res, next) => {
  const code = req.body.message;
  savePythonFile(code);

  try {
    console.log("trying to run user python code: " + code);

    let options = {
      mode: "text",
      pythonOptions: ["-u"],
      scriptPath: "SandBox/API",
      args: ["value1", "value2", "value3"],
    };

    const pyshell = new PythonShell("search_and_find.py", options);

    let dataToSend = "";

    pyshell.on("message", (message) => {
      console.log("result: " + message);
      dataToSend = message;
    });

    pyshell.end((err, code, signal) => {
      if (err) {
        console.log("error here");
        console.log(err);
        //set variable responseError to the first error in the array
        const responseError = err.stack.split("at")[0];
        let responseErrorClean = responseError.replace("File \"SandBox/UserPythonScripts/tester.py\",", "");
        responseErrorClean = responseErrorClean.replace("line", "Line");
        responseErrorClean = responseErrorClean.replace(/\r?\n|\r/g, " ");

        res.status(500).json({ success: false, userCodeReturn: responseErrorClean });
        
      } else {
        console.log("The exit code was: " + code);
        console.log("The exit signal was: " + signal);
        console.log("finished");
        res.status(200).json({ success: true, userCodeReturn: dataToSend });
      }
    });
  } catch (err) {
    console.log(err);
    console.log("error");
    res.status(500).json({ success: false, error: err });
  }
};