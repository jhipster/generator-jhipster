/**
* System configuration for Angular 2 app
* Adjust as necessary for your application needs.
*/
(function(global) {
    // default js extension set true
    System.defaultJsExtension  = true;
    // map tells the System loader where to look for things
    var map = {
        'app': 'app', // 'dist',
        '@angular': 'vendor/@angular',
        'rxjs': 'vendor/rxjs',
        'main': 'app.main',
        '@ng-bootstrap': 'vendor/@ng-bootstrap'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app': { main: 'app.main' },
        'rxjs': {},
        '@ng-bootstrap/ng-bootstrap': {main: 'index.js', defaultExtension: 'js'}
    };
    var ngPackageNames = [
        'common',
        'compiler',
        'core',
        'forms',
        'http',
        'platform-browser',
        'platform-browser-dynamic',
        'router',
        'upgrade',
    ];
    // Packages related to ngbootstrap 
    var ngBootstrapPackageNames = [
        'accordion',
        'alert',
        'radio',
        'carousel',
        'collapse',
        'datepicker',
        'dropdown',
        'modal',
        'pagination',
        'popover',
        'progressbar',
        'rating',
        'tabset',
        'timepicker',
        'tooltip',
        'typeahead',
        'util'
    ];

    // Individual files (~300 requests):
    function packIndex(pkgName) {
        packages['@angular/'+ pkgName] = { main: 'index' };
    }
    // Bundled (~40 requests):
    function packUmd(pkgName) {
        packages['@angular/'+ pkgName] = { main: '/bundles/' + pkgName + '.umd' };
    };
    // ng-bootstrap index packing
    function ngBootstrapPackIndex(pkgName) {
        packages['@ng-bootstrap/ng-bootstrap/' + pkgName] = {main: 'index.js', defaultExtension: 'js'};
    };
    // Most environments should use UMD; some (Karma) need the individual index files
    var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;
    // Add package entries for angular packages
    ngPackageNames.forEach(setPackageConfig);
    ngBootstrapPackageNames.forEach(ngBootstrapPackIndex);
    var config = {
        map: map,
        packages: packages
    }
    System.config(config);
})(this);
