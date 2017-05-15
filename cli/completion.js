
const tabtab = require('tabtab')({
    name: 'jhipster'
});


module.exports.init = (program, binName) => {
    // This method should not log anything to console as it will be shown in completion
    // Needed to avoid unknown command trigger, should be hidden
    program
        .command('completion')
        .description('Print command completion script')
        .action((opts) => {});
    // General handler. Gets called on `jhipster <tab>` and `jhipster stuff ... <tab>`
    const commands = program.commands.map(d => d._name);
    const alias = program.commands.map(d => d._alias);
    const opts = program.options.map(d => d.long);
    const optShort = program.options.map(d => d.short);
    const allOpts = [].concat(commands, alias, optShort, opts).filter(d => d !== undefined);

    tabtab.on(binName, (data, done) => done(null, allOpts));
    tabtab.start();
};
