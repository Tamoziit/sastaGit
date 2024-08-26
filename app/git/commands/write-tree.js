const path = require('path');
const fs = require('fs');
const zlib = require('zlib');
const crypto = require('crypto');

function writeFileBlob(currentPath) {
    const contents = fs.readFileSync(currentPath);
    const len = contents.length;

    const blobHeader = `blob ${len}\0`;
    const blob = Buffer.concat([Buffer.from(blobHeader), contents]); //creating blob

    const hash = crypto.createHash("sha1").update(blob).digest("hex"); //creating hash

    const folder = hash.slice(0, 2);
    const file = hash.slice(2);
    const completeFolderPath = path.join(process.cwd(), ".git", "objects", folder);
    if (!fs.existsSync(completeFolderPath)) fs.mkdirSync(completeFolderPath);

    const compressedData = zlib.deflateSync(blob);
    fs.writeFileSync(path.join(completeFolderPath, file), compressedData); //writing content to "./git/objects/"

    return hash;
}

class WriteTreeCommand {
    constructor() { }

    execute() {
        // Recursively read all files & directories.
        // If item is directory -> recursive step iteration for that dir. again
        // If file, then create a blob, write hash to .git/objects/ & write entry to tree.

        function recursiveCreateTree(basePath) {
            const dirContents = fs.readdirSync(basePath);
            const result = []; //array to stored all the hashes for complete tree content

            for (const dirContent of dirContents) {
                if (dirContent.includes('.git')) continue; //we are not supposed to track the directories & files under .git folder

                const currentPath = path.join(basePath, dirContent);
                const stat = fs.statSync(currentPath); //Fetching the file type

                if (stat.isDirectory()) {
                    const sha = recursiveCreateTree(currentPath); //recursively creating tree for inner folder
                    if (sha) {
                        result.push({
                            mode: '040000',
                            basename: path.basename(currentPath),
                            sha
                        });
                    }
                } else if (stat.isFile()) {
                    const sha = writeFileBlob(currentPath);
                    result.push({
                        mode: '100644',
                        basename: path.basename(currentPath),
                        sha
                    });
                }
            }

            if (dirContents.length === 0 || result.length === 0) {
                return null; //not tracking empty directories
            }

            const treeData = result.reduce((acc, current) => {
                const { mode, basename, sha } = current;
                return Buffer.concat([
                    acc,
                    Buffer.from(`${mode} ${basename}\0`),
                    Buffer.from(sha, "hex")
                ]); //creates <mode> <basename>\0<20 byte sha>
            }, Buffer.alloc(0));

            const tree = Buffer.concat([
                Buffer.from(`tree ${treeData.length}\0`),
                treeData
            ]); //creates the final tree structure
            /* tree <size>\0
               <mode> <basename>\0<20 byte sha> //treedata
               <mode> <basename>\0<20 byte sha>...
            */

            const hash = crypto.createHash("sha1").update(tree).digest("hex"); //creating a hash for the full tree.
            //Writing the complete hash under ./git/objects/
            const folder = hash.slice(0, 2);
            const file = hash.slice(2);
            const treeFolderPath = path.join(process.cwd(), ".git", "objects", folder);
            if (!fs.existsSync(treeFolderPath)) fs.mkdirSync(treeFolderPath);

            const compressedData = zlib.deflateSync(tree);
            fs.writeFileSync(path.join(treeFolderPath, file), compressedData);

            return hash;
        }

        const finalSHA = recursiveCreateTree(process.cwd());
        process.stdout.write(finalSHA); //final sha of the complete tree
    }
}

module.exports = WriteTreeCommand;