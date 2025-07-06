// These constants are injected via webpack DefinePlugin variables.
// You can add more variables in webpack.common.js or in profile specific webpack.<dev|prod>.js files.
// If you change the values in the webpack config files, you need to re run webpack to update the application

declare const __VERSION__: string;
declare const SERVER_API_URL: string;
declare const I18N_HASH: string;
