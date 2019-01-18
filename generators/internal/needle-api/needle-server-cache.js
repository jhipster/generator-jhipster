const chalk = require('chalk');
const needleServer = require('./needle-server');
const constants = require('../../generator-constants');

const SERVER_MAIN_SRC_DIR = constants.SERVER_MAIN_SRC_DIR;

module.exports = class extends needleServer {
    addEntityToCache(entityClass, relationships, packageName, packageFolder, cacheProvider) {
        this.addEntryToCache(`${packageName}.domain.${entityClass}.class.getName()`, packageFolder, cacheProvider);
        // Add the collections linked to that entity to ehcache
        relationships.forEach(relationship => {
            const relationshipType = relationship.relationshipType;
            if (relationshipType === 'one-to-many' || relationshipType === 'many-to-many') {
                this.addEntryToCache(
                    `${packageName}.domain.${entityClass}.class.getName() + ".${relationship.relationshipFieldNamePlural}"`,
                    packageFolder,
                    cacheProvider
                );
            }
        });
    }

    addEntryToCache(entry, packageFolder, cacheProvider) {
        const errorMessage = chalk.yellow(`\nUnable to add ${entry} to CacheConfiguration.java file.`);
        const cachePath = `${SERVER_MAIN_SRC_DIR}${packageFolder}/config/CacheConfiguration.java`;

        if (cacheProvider === 'ehcache') {
            const needle = 'jhipster-needle-ehcache-add-entry';
            const content = `cm.createCache(${entry}, jcacheConfiguration);`;

            this._doAddBlockContentToFile(cachePath, needle, content, errorMessage);
        } else if (cacheProvider === 'infinispan') {
            const needle = 'jhipster-needle-infinispan-add-entry';
            const content = `registerPredefinedCache(${entry}, new JCache<Object, Object>(
                cacheManager.getCache(${entry}).getAdvancedCache(), this,
                ConfigurationAdapter.create()));`;

            this._doAddBlockContentToFile(cachePath, needle, content, errorMessage);
        }
    }

    _doAddBlockContentToFile(cachePath, needle, content, errorMessage) {
        const rewriteFileModel = this.generateFileModel(cachePath, needle, content);
        this.addBlockContentToFile(rewriteFileModel, errorMessage);
    }
};
