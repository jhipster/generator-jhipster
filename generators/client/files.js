
module.exports = {
    writeFiles
};


function writeFiles() {
    this.copy('_dummy.txt', 'dummy.txt');
}
