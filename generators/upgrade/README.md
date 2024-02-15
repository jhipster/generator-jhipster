# upgrade sub-generador

Upgrades the application to a newer generator-jhipster version.

The upgrade process generates 4 commits:

- the reference application
- a merge commit with unrelated histories
- the upgrade application
- a merge commit to apply the upgrade commit to the existing application

## Upgrading from v7

To upgrade to v8 you need to upgrade to v7.9.4 before due to node v18/v20 compatibility.
If you use blueprint that uses jhipster v7, you need to use [jhipster-migrate](https://github.com/jhipster/generator-jhipster-migrate/).
