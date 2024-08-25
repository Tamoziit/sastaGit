const path = require("path");
const fs = require('fs');
const crypto = require('crypto');
const zlib = require('zlib');

class HashObjectCommand {
    constructor(flag, filepath) {
        this.flag = flag;
        this.filepath = filepath;
    }

    execute() {
        // Validating that the filepath provided is valid & the file exists
        // Reading the file
        // Creating the Blob object file
        // Compressing the blob
        // Calculating the hash of the file
        // If flag == -w, then writing the file in folder structure eg: 82/gdjj256627727829971vd828392902b

        const filepath = path.resolve(this.filepath);
        if (!fs.existsSync(filepath))
            throw new Error(`could not open ${this.filepath} for reading: No such file or directory`);

        const fileContents = fs.readFileSync(filepath);
        const fileLength = fileContents.length;

        //Creating the blob
        const header = `blob ${fileLength}\0`;
        const blob = Buffer.concat([Buffer.from(header), fileContents]); //Concatenating blob header & file contents using Buffer Class to form the blob

        //creating blob hash
        const hash = crypto.createHash("sha1").update(blob).digest("hex"); //digest("hex")  --> returns the hash in hexadecimal format

        if (this.flag && this.flag === '-w') {
            const folder = hash.slice(0, 2);
            const file = hash.slice(2);
            const completeFolderPath = path.join(process.cwd(), 'test-dir', 'objects', folder);

            if (!fs.existsSync(completeFolderPath)) {
                fs.mkdirSync(completeFolderPath); //creating folder if DNE
            }
            const compressedData = zlib.deflateSync(blob); //compressing data
            fs.writeFileSync(
                path.join(completeFolderPath, file), compressedData
            );
        }

        process.stdout.write(hash);
    }
}

module.exports = HashObjectCommand;