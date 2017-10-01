const JDLApplication = require('../core/jdl_application');
const fs = require('fs');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportApplications
};

function exportApplications(applications) {
  if (!applications) {
    throw new BuildException(
      exceptions.NullPointer,
      'Applications have to be passed to be exported.');
  }
  Object.keys(applications).forEach((applicationName) => {
    const application = applications[applicationName];
    const errors = JDLApplication.checkValidity(application);
    if (errors.length !== 0) {
      throw new BuildException(
        exceptions.InvalidObject,
        `The application must be valid in order to be converted.\nErrors: ${errors.join(', ')}`);
    }
    const finalApplication = {
      'generator-jhipster': application.config
    };
    finalApplication['generator-jhipster'].promptValues = {
      packageName: application.config.packageName
    };
    delete finalApplication['generator-jhipster'].packageName;
    writeApplicationFile(finalApplication);
  });
}

function writeApplicationFile(application) {
  fs.writeFileSync('.yo-rc.json', JSON.stringify(application, null, 2));
}
