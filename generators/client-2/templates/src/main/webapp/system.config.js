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
        '@ng-bootstrap': 'vendor/@ng-bootstrap',
        'ui-router-ng2': 'vendor/ui-router-ng2/_bundles/ui-router-ng2',
        'jquery' : 'vendor/jquery/dist'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app': { main: 'app.main' },
        'rxjs': {},
        '@ng-bootstrap/ng-bootstrap': {main: '/bundles/ng-bootstrap', defaultExtension: 'js'},
        'ui-router-ng2': {},
        'jquery': { main: 'jquery.min' }
    };
    var ngPackageNames = [
        'common',
        'compiler',
        'core',
        'forms',
        'http',
        'platform-browser',
        'platform-browser-dynamic',
        'upgrade',
    ];

    // Individual files (~300 requests):
    function packIndex(pkgName) {
        packages['@angular/'+ pkgName] = { main: 'index' };
    }
    // Bundled (~40 requests):
    function packUmd(pkgName) {
        packages['@angular/'+ pkgName] = { main: '/bundles/' + pkgName + '.umd' };
    };
    // Most environments should use UMD; some (Karma) need the individual index files
    var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;
    // Add package entries for angular packages
    ngPackageNames.forEach(setPackageConfig);

    var config = {
        meta: { "ui-router-ng2": { format: "cjs" } },
        map: map,
        packages: packages
    }
    System.config(config);
})(this);
