> 本文档是 [README.md](README.md) 的中文翻译，若两者有出入以英文原版为准。

[![Logo][jhipster-image]][jhipster-url]

[![NPM version][npm-image]][npm-url] [![Downloads][npmcharts-image]][npmcharts-url] [![Gitter][gitter-badge-image]][gitter-badge-url] [![Known Vulnerabilities][snyk-image]][snyk-url]

[![Generator Build Status][github-actions-generator-image]][github-actions-url] [![Angular Build Status][github-actions-angular-image]][github-actions-url] [![React Build Status][github-actions-react-image]][github-actions-url] [![Vue Build Status][github-actions-vue-image]][github-actions-url] [![Revved up by Develocity](https://img.shields.io/badge/Revved%20up%20by-Develocity-06A0CE?logo=Gradle&labelColor=02303A)](https://ge.jhipster.tech/scans)

你好，Java Hipster！

完整的文档和信息请访问我们的网站 [https://www.jhipster.tech][jhipster-url]。

请在提交 issue 之前阅读我们的[指南](/CONTRIBUTING.md#submitting-an-issue)。如果你报告的是 bug，请使用[这里][issue-template]预填的 bug 模板。功能请求和咨询可以使用[此模板][feature-template]。如果你发现了潜在的安全问题，请阅读我们的[安全政策](/SECURITY.md)并先私下联系我们：https://github.com/jhipster/generator-jhipster/security/policy

在你并非自己编写的项目上运行生成器之前，请阅读[`.yo-rc.json` 的信任模型](/SECURITY.md#the-trust-model-of-yo-rcjson)：该文件的属性会成为生成应用的一部分，其中声明的蓝图（blueprint）会在你的机器上执行。

## 参与贡献

无论贡献大小，我们都深感荣幸。有关参与项目贡献的任何信息，请参阅我们的[贡献指南与说明文档](https://github.com/jhipster/generator-jhipster/blob/main/CONTRIBUTING.md)。

## 支持的 Java 和 Node 版本

以下 Java 与 Node 组合已由 GitHub Actions 测试和验证：

| Java  | Node  | 状态 |
| ----- | ----- | ---- |
| 21/25 | 22/24 | ✅   |

## 赞助商

成为赞助商来支持本项目！[成为赞助商](https://opencollective.com/generator-jhipster)或[了解更多关于赞助本项目的信息](https://www.jhipster.tech/sponsors/)。

**感谢我们的赞助商！**

### 金牌赞助商

[![GoldSponsors][gold-sponsors-image]][gold-sponsors-url]

### 铜牌赞助商

[![BronzeSponsors][bronze-sponsors-image]][bronze-sponsors-url]

### 支持者

**感谢所有支持者！**

[![Backers][backers-image]][backers-url]

<object data="https://opencollective.com/generator-jhipster/tiers/backer.svg?avatarHeight=40&width=890&button=false" type="image/svg+xml"></object>

## 每日构建

更多构建见 [hipster-labs/jhipster-daily-builds](https://github.com/hipster-labs/jhipster-daily-builds)

| 流水线状态                                                                           |
| :----------------------------------------------------------------------------------- |
| [![Angular Maven SQL][ng-maven-sql.yaml-badge]][ng-maven-sql.yaml-link]              |
| [![Angular Maven NoSQL][ng-maven-nosql.yaml-badge]][ng-maven-nosql.yaml-link]        |
| [![Angular Gradle SQL][ng-gradle-sql.yaml-badge]][ng-gradle-sql.yaml-link]           |
| [![Angular Gradle NoSQL][ng-gradle-nosql.yaml-badge]][ng-gradle-nosql.yaml-link]     |
| [![React Maven SQL][react-maven-sql.yaml-badge]][react-maven-sql.yaml-link]          |
| [![React Maven NoSQL][react-maven-nosql.yaml-badge]][react-maven-nosql.yaml-link]    |
| [![React Gradle SQL][react-gradle-sql.yaml-badge]][react-gradle-sql.yaml-link]       |
| [![React Gradle NoSQL][react-gradle-nosql.yaml-badge]][react-gradle-nosql.yaml-link] |
| [![Vue Maven SQL][vue-maven-sql.yaml-badge]][vue-maven-sql.yaml-link]                |
| [![Vue Maven NoSQL][vue-maven-nosql.yaml-badge]][vue-maven-nosql.yaml-link]          |
| [![Vue Gradle SQL][vue-gradle-sql.yaml-badge]][vue-gradle-sql.yaml-link]             |
| [![Vue Gradle NoSQL][vue-gradle-nosql.yaml-badge]][vue-gradle-nosql.yaml-link]       |
| [![Elasticsearch][elasticsearch.yaml-badge]][elasticsearch.yaml-link]                |
| [![Monolith OAuth 2.0][monolith-oauth2.yaml-badge]][monolith-oauth2.yaml-link]       |
| [![No Database][no-database.yaml-badge]][no-database.yaml-link]                      |
| [![Microservices JWT][ms-jwt.yaml-badge]][ms-jwt.yaml-link]                          |
| [![Microservices OAuth 2.0][ms-oauth2.yaml-badge]][ms-oauth2.yaml-link]              |
| [![Docker Image][docker-image.yaml-badge]][docker-image.yaml-link]                   |
| [![Official Windows][windows.yaml-badge]][windows.yaml-link]                         |

## JHipster 示例项目分析

[![sonar-quality-gate][sonar-quality-gate]][sonar-url] [![sonar-coverage][sonar-coverage]][sonar-url] [![sonar-bugs][sonar-bugs]][sonar-url] [![sonar-vulnerabilities][sonar-vulnerabilities]][sonar-url] [![sonar-sample-code-smells-badge][sonar-sample-code-smells-badge]][sonar-sample-code-smells-url]

[ng-maven-sql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ng-maven-sql.yaml/badge.svg
[ng-maven-sql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ng-maven-sql.yaml
[ng-maven-nosql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ng-maven-nosql.yaml/badge.svg
[ng-maven-nosql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ng-maven-nosql.yaml
[ng-gradle-sql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ng-gradle-sql.yaml/badge.svg
[ng-gradle-sql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ng-gradle-sql.yaml
[ng-gradle-nosql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ng-gradle-nosql.yaml/badge.svg
[ng-gradle-nosql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ng-gradle-nosql.yaml
[react-maven-sql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/react-maven-sql.yaml/badge.svg
[react-maven-sql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/react-maven-sql.yaml
[react-maven-nosql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/react-maven-nosql.yaml/badge.svg
[react-maven-nosql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/react-maven-nosql.yaml
[react-gradle-sql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/react-gradle-sql.yaml/badge.svg
[react-gradle-sql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/react-gradle-sql.yaml
[react-gradle-nosql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/react-gradle-nosql.yaml/badge.svg
[react-gradle-nosql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/react-gradle-nosql.yaml
[vue-maven-sql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/vue-maven-sql.yaml/badge.svg
[vue-maven-sql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/vue-maven-sql.yaml
[vue-maven-nosql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/vue-maven-nosql.yaml/badge.svg
[vue-maven-nosql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/vue-maven-nosql.yaml
[vue-gradle-sql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/vue-gradle-sql.yaml/badge.svg
[vue-gradle-sql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/vue-gradle-sql.yaml
[vue-gradle-nosql.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/vue-gradle-nosql.yaml/badge.svg
[vue-gradle-nosql.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/vue-gradle-nosql.yaml
[elasticsearch.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/elasticsearch.yaml/badge.svg
[elasticsearch.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/elasticsearch.yaml
[monolith-oauth2.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/monolith-oauth2.yaml/badge.svg
[monolith-oauth2.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/monolith-oauth2.yaml
[no-database.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/no-database.yaml/badge.svg
[no-database.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/no-database.yaml
[ms-jwt.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ms-jwt.yaml/badge.svg
[ms-jwt.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ms-jwt.yaml
[ms-oauth2.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ms-oauth2.yaml/badge.svg
[ms-oauth2.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/ms-oauth2.yaml
[docker-image.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/docker-image.yaml/badge.svg
[docker-image.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/docker-image.yaml
[windows.yaml-badge]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/windows.yaml/badge.svg
[windows.yaml-link]: https://github.com/hipster-labs/jhipster-daily-builds/actions/workflows/windows.yaml
[sonar-url]: https://sonarcloud.io/dashboard?id=jhipster-sample-application
[sonar-quality-gate]: https://sonarcloud.io/api/project_badges/measure?project=jhipster-sample-application&metric=alert_status
[sonar-coverage]: https://sonarcloud.io/api/project_badges/measure?project=jhipster-sample-application&metric=coverage
[sonar-bugs]: https://sonarcloud.io/api/project_badges/measure?project=jhipster-sample-application&metric=bugs
[sonar-sample-code-smells-badge]: https://sonarcloud.io/api/project_badges/measure?project=jhipster-sample-application&metric=code_smells
[sonar-sample-code-smells-url]: https://sonarcloud.io/project/issues?resolved=false&types=CODE_SMELL&id=jhipster-sample-application
[sonar-vulnerabilities]: https://sonarcloud.io/api/project_badges/measure?project=jhipster-sample-application&metric=vulnerabilities
[jhipster-image]: https://raw.githubusercontent.com/jhipster/jhipster-artwork/main/logos/v2/normal/V2%20JHipster%20RGB.png
[jhipster-url]: https://www.jhipster.tech/
[npm-image]: https://badge.fury.io/js/generator-jhipster.svg
[npm-url]: https://npmjs.org/package/generator-jhipster
[github-actions-generator-image]: https://github.com/jhipster/generator-jhipster/actions/workflows/generator.yml/badge.svg?branch=main
[github-actions-angular-image]: https://github.com/jhipster/generator-jhipster/actions/workflows/angular.yml/badge.svg?branch=main
[github-actions-react-image]: https://github.com/jhipster/generator-jhipster/actions/workflows/react.yml/badge.svg?branch=main
[github-actions-vue-image]: https://github.com/jhipster/generator-jhipster/actions/workflows/vue.yml/badge.svg?branch=main
[github-actions-url]: https://github.com/jhipster/generator-jhipster/actions
[backers-image]: https://opencollective.com/generator-jhipster/tiers/backer.svg?avatarHeight=70&width=890
[backers-url]: https://opencollective.com/generator-jhipster
[bronze-sponsors-image]: https://opencollective.com/generator-jhipster/tiers/bronze-sponsor.svg?avatarHeight=120&width=890
[bronze-sponsors-url]: https://opencollective.com/generator-jhipster
[gold-sponsors-image]: https://opencollective.com/generator-jhipster/tiers/gold-sponsor.svg?avatarHeight=180&width=890
[gold-sponsors-url]: https://opencollective.com/generator-jhipster
[issue-template]: https://github.com/jhipster/generator-jhipster/issues/new?template=BUG_REPORT.md
[feature-template]: https://github.com/jhipster/generator-jhipster/issues/new?template=FEATURE_REQUEST.md
[npmcharts-image]: https://img.shields.io/npm/dm/generator-jhipster.svg?label=Downloads&style=flat
[npmcharts-url]: https://npm.chart.dev/generator-jhipster?primary=sky&gray=cool&theme=dark
[gitter-badge-image]: https://badges.gitter.im/jhipster/generator-jhipster.svg
[gitter-badge-url]: https://gitter.im/jhipster/generator-jhipster?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge
[snyk-image]: https://snyk.io/test/npm/generator-jhipster/badge.svg
[snyk-url]: https://snyk.io/test/npm/generator-jhipster
