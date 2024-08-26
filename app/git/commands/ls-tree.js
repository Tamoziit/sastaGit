const path = require('path');
const fs = require('fs');
const zlib = require('zlib');

class LsTreeCommand {
    constructor(flag, sha) {
        this.flag = flag;
        this.sha = sha;
    }

    execute() {
        // read the object file 
        // decompress the file 
        // We get a tree output 
        // if flag provided then print only names, else print full tree structure

        const flag = this.flag;
        const sha = this.sha;
        const folder = sha.slice(0, 2);
        const file = sha.slice(2);

        const folderPath = path.join(process.cwd(), '.git', 'objects', folder);
        const filePath = path.join(folderPath, file);
        if (!fs.existsSync(folderPath))
            throw new Error(`Not a valid object name ${sha}`);
        if (!fs.existsSync(filePath))
            throw new Error(`Not a valid object name ${sha}`);

        const fileContent = fs.readFileSync(filePath);
        const outputBuffer = zlib.inflateSync(fileContent);

        //Ouput formatting
        const output = outputBuffer.toString().split("\0");
        const treeContent = output.slice(1).filter((e) => e.includes(" ")); //Excluding the 1st line of content & filtering out those elements which have space in them(before them.
        const names = treeContent.map((e) => e.split(" ")[1]); //getting the names only

        //assuming --name-only flag is provided always, so we need names only 
        names.forEach((name) => process.stdout.write(`${name}\n`));
    }
}

module.exports = LsTreeCommand;