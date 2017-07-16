

const fs = require('fs');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportToJDL
};

function exportToJDL(jdl, path) {
  if (!jdl) {
    throw new BuildException(
      exceptions.NullPointer,
      'A JDLObject has to be passed to be exported.');
  }
  if (!path) {
    path = './jhipster-jdl.jh';
  }
  fs.writeFileSync(path, jdl.toString());
}
