// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
import fs = require('fs');
import { lighthouse, pa11y, prepareAudit } from 'cypress-audit';
import ReportGenerator = require('lighthouse/report/generator/report-generator');
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = async on => {
  // `on` is used to hook into various events Cypress emits
  on('before:browser:launch', (browser, launchOptions) => {
    prepareAudit(launchOptions);
    if (browser.name === 'chrome' && browser.isHeadless) {
      launchOptions.args.push('--disable-gpu');
      return launchOptions;
    }
  });

  on('task', {
    lighthouse: lighthouse(lighthouseReport => {
      !fs.existsSync('target/cypress') && fs.mkdirSync('target/cypress', { recursive: true });
      fs.writeFileSync('target/cypress/lhreport.html', ReportGenerator.generateReport(lighthouseReport.lhr, 'html'));
    }),
    pa11y: pa11y(),
  });
};
