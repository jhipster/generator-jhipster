class JDLImporter {
  constructor(files) {
    if (!files) {
      throw new Error('JDL files must be passed so as to be imported.');
    }
    this.files = files;
  }
}

module.exports = JDLImporter;
