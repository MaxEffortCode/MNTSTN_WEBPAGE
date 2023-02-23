const { PythonShell } = require('python-shell');

//need to fix this cehck chat gpt
exports.pythonSandbox = async (req, res, next) => {
    try {
        let options = {
        mode: 'text',
        pythonPath: 'C:/Users/Owner/AppData/Local/Programs/Python/Python39/python.exe',
        pythonOptions: ['-u'],
        scriptPath: 'C:/Users/Owner/Desktop/NodeJS/NodeJS-UserNM/Sandbox',
        args: [req.body.code]
        };
        PythonShell.run('sandbox.py', options, function (err, results) {
        if (err) throw err;
        console.log('results: %j', results);
        res.send(results);
        });
    } catch (err) {
        console.log(err);
        res.send(err);
    }
}

