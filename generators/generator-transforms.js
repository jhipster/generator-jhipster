const through = require('through2');
const prettier = require('prettier');

const prettierOptions = {
    printWidth: 140,
    singleQuote: true,
    useTabs: false,
    // js and ts rules:
    arrowParens: 'avoid',
    // jsx and tsx rules:
    jsxBracketSameLine: false,
};

const prettierTransform = function (defaultOptions) {
    const transform = (file, encoding, callback) => {
        /* resolve from the projects config */
        prettier.resolveConfig(file.relative).then((options) => {
            const str = file.contents.toString('utf8');
            if (!options || Object.keys(options).length === 0) {
                options = defaultOptions;
            }
            // for better errors
            options.filepath = file.relative;
            const data = prettier.format(str, options);
            file.contents = Buffer.from(data);
            callback(null, file);
        });
    };
    return through.obj(transform);
};

module.exports = {
    prettierTransform,
    prettierOptions
};
