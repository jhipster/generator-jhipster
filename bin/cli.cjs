// Cleanup loaders options, we don't want to pass to child processes.
delete process.env.NODE_OPTIONS;

require('../cli/jhipster.cjs');
