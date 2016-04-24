module.exports = {
    app: '<%= MAIN_SRC_DIR %>',
    dist: '<%= DIST_DIR %>',
    test: '<%= TEST_SRC_DIR %>'<% if(useSass) { %>,
    scss: '<%= MAIN_SRC_DIR %>scss/',
    sassSrc: '<%= MAIN_SRC_DIR %>scss/**/*.{scss,sass}',
    sassVendor: 'src/main/webapp/scss/vendor.scss',
    cssDir: '<%= MAIN_SRC_DIR %>content/css'<% } %>,
    bower: '<%= MAIN_SRC_DIR %>bower_components/',
    tmp: '<%= BUILD_DIR %>tmp',
    revManifest: '<%= BUILD_DIR %>tmp/rev-manifest.json',
    port: 9000,
    apiPort: <%= serverPort %>,
    liveReloadPort: 35729,
    uri: 'http://localhost:'
};
