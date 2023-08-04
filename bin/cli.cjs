// Cleanup loaders options, we don't want to pass to child processes.
delete process.env.NODE_OPTIONS;

process.env.JHIPSTER_DEV_BLUEPRINT = true;

require('../cli/jhipster.cjs');
