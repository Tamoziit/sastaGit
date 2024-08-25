const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

class CatFileCommand {
    constructor(flag, commitSHA) {
        this.flag = flag; //creating objects of the parameters
        this.commitSHA = commitSHA;
    }

    execute() {
        //Navigating to .git/objects/<1st 2 digit of commitSHA>
        //Reading the files present under the path
        //De-compressing the file
        //displaying the output in CLI

        const flag = this.flag;
        const commitSHA = this.commitSHA;

        switch (flag) {
            case '-p': {
                const folder = commitSHA.slice(0, 2); //1st 2 chars
                const file = commitSHA.slice(2); //remaining forms the file

                const completePath = path.join(process.cwd(), '.git', "objects", folder, file); //cwd - currrent working dir --> hence path = cwd/.git/objects/82/997765646542fgxc

                if (!fs.existsSync(completePath)) //checks if the object exists inside the object dir.
                    throw new Error(`Not a valid object name ${commitSHA}`);

                const fileContents = fs.readFileSync(completePath); //reads the file

                const outputBuffer = zlib.inflateSync(fileContents); //Decompressing the file using zlib package.
                const output = outputBuffer.toString().split("\x00")[1]; //output formatting to delete unnecessary default null chars or newlines

                process.stdout.write(output); //standard output or logging the file instead of console.log();
            }
                break;
            default:
                throw new Error(`Unknown flag ${flag}`);
        }
    }
}

module.exports = CatFileCommand;