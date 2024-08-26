const path = require("path");
const fs = require('fs');
const crypto = require('crypto');
const zlib = require('zlib');

class CommitTreeCommand {
    constructor(tree, parentSHA, message) {
        this.treeSHA = tree;
        this.parentSHA = parentSHA;
        this.message = message;
    }

    execute() {
        const commitContentBuffer = Buffer.concat([
            Buffer.from(`tree ${this.treeSHA}\n`),
            Buffer.from(`parent ${this.parentSHA}\n`),
            Buffer.from(`author Tamoziit <tamojitdas181007@gmail.com> ${Date.now()} +0000\n`),
            Buffer.from(`commiter Tamoziit <tamojitdas181007@gmail.com> ${Date.now()} +0000\n\n`),
            Buffer.from(`${this.message}\n`)
        ]);

        const header = `commit ${commitContentBuffer.length}\0`;
        const data = Buffer.concat([Buffer.from(header), commitContentBuffer]);

        const hash = crypto.createHash("sha1").update(data).digest("hex");

        const folder = hash.slice(0, 2);
        const file = hash.slice(2);
        const completeFolderPath = path.join(process.cwd(), '.git', 'objects', folder);

        if (!fs.existsSync(completeFolderPath)) {
            fs.mkdirSync(completeFolderPath);
        }
        const compressedData = zlib.deflateSync(data); //compressing data
        fs.writeFileSync(path.join(completeFolderPath, file), compressedData);

        process.stdout.write(hash);
    }
}

module.exports = CommitTreeCommand;