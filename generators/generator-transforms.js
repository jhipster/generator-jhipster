const through = require('through2');
const filter = require('gulp-filter');
const prettier = require('prettier');

const typescriptFilter = filter(['**/*.{ts,tsx}'], { restore: true });

const defaultTsPrettierOptions = {
    printWidth: 140,
    singleQuote: true,
    jsxBracketSameLine: false,
    parser: 'typescript',
    arrowParens: 'always',
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
    typescriptFilter,
    prettierTransform,
    defaultTsPrettierOptions
};
