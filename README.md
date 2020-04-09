[![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url]

[![GitHub Actions Build Status][github-actions-image]][github-actions-url] [![Azure DevOps Build Status][azure-devops-image]][azure-devops-url]

[![sonar-quality-gate][sonar-quality-gate]][sonar-url] [![sonar-coverage][sonar-coverage]][sonar-url] [![sonar-bugs][sonar-bugs]][sonar-url] [![sonar-vulnerabilities][sonar-vulnerabilities]][sonar-url]

---

Welcome to the official repository of everything common to JHipster and its projects, like the JDL (JHipster Domain Language).

Please read our [guidelines](/CONTRIBUTING.md#submission-guidelines) before submitting an issue.
If your issue is a bug, please use the bug template pre-populated [here](https://github.com/jhipster/jhipster-core/issues/new?template=BUG_REPORT.md).
For feature requests and queries you can use [this template](https://github.com/jhipster/jhipster-core/issues/new?template=FEATURE_REQUEST.md).

### Contributing to JHipster-Core

For more details about the project structure and detailed examples on how to update JDL please refer our 
[documentation pages](https://github.com/jhipster/jhipster-core/blob/master/docs/contributing.md).

### Releasing

1. Commit any changes done, to ensure working directory is clean
2. Run the release script - You need to be logged into NPM
    * To release a patch version, simply run `npm run release-patch`
    * To release a minor version, simply run `npm run release-minor`
    * To release a major version, simply run `npm run release-major`

[azure-devops-image]: https://dev.azure.com/jhipster/jhipster-core/_apis/build/status/jhipster.jhipster-core?branchName=master
[azure-devops-url]: https://dev.azure.com/jhipster/jhipster-core/_build
[daviddm-image]: https://david-dm.org/jhipster/jhipster-core.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/jhipster/jhipster-core
[github-actions-image]: https://github.com/jhipster/jhipster-core/workflows/Node%20CI/badge.svg
[github-actions-url]: https://github.com/jhipster/jhipster-core/actions
[npm-image]: https://badge.fury.io/js/jhipster-core.svg
[npm-url]: https://npmjs.org/package/jhipster-core
[sonar-bugs]: https://sonarcloud.io/api/project_badges/measure?project=jhipster-core&metric=bugs
[sonar-coverage]: https://sonarcloud.io/api/project_badges/measure?project=jhipster-core&metric=coverage
[sonar-quality-gate]: https://sonarcloud.io/api/project_badges/measure?project=jhipster-core&metric=alert_status
[sonar-url]: https://sonarcloud.io/dashboard?id=jhipster-core
[sonar-vulnerabilities]: https://sonarcloud.io/api/project_badges/measure?project=jhipster-core&metric=vulnerabilities
