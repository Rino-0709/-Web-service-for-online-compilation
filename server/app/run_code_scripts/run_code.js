const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const code = process.argv[2];
const input = process.argv[3];

const codePath = path.join(__dirname, 'temp_code.js');
const inputPath = path.join(__dirname, 'temp_input.txt');

fs.writeFileSync(codePath, code);
fs.writeFileSync(inputPath, input);

exec(`node ${codePath} < ${inputPath}`, (error, stdout, stderr) => {
    const exitCode = error ? error.code : 0;
    const response = {
        output: stdout,
        error: stderr,
        exit_code: exitCode
    };
    console.log(JSON.stringify(response));

    fs.unlinkSync(codePath);
    fs.unlinkSync(inputPath);
});
