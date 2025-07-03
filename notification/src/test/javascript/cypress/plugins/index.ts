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
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { lighthouse, pa11y, prepareAudit } from 'cypress-audit';

export default (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
  on('before:browser:launch', (browser, launchOptions) => {
    prepareAudit(launchOptions);
    if (browser.name === 'chrome' && browser.isHeadless) {
      launchOptions.args.push('--disable-gpu');
      return launchOptions;
    }
  });

  // Allows logging with cy.task('log', 'message') or cy.task('table', object)
  on('task', {
    log(message) {
      console.log(message);
      return null;
    },
    table(message) {
      console.table(message);
      return null;
    },
  });

  on('task', {
    lighthouse: lighthouse(async lighthouseReport => {
      const { default: ReportGenerator } = await import('lighthouse/report/generator/report-generator');
      if (!existsSync('build/cypress/')) {
        mkdirSync('build/cypress/', { recursive: true });
      }
      writeFileSync('build/cypress/lhreport.html', ReportGenerator.generateReport(lighthouseReport.lhr, 'html'));
    }),
    pa11y: pa11y(),
  });
  return config;
};
