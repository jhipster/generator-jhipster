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
        'main': 'app.main'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app': { main: 'app.main' },
        'rxjs': {}
    };
    var ngPackageNames = [
        'common',
        'compiler',
        'core',
        'http',
        'platform-browser',
        'platform-browser-dynamic',
        'router',
        'upgrade',
    ];
    // Individual files (~300 requests):
    function packIndex(pkgName) {
        packages['@angular/'+ pkgName] = { main: 'index' };
    }
    // Bundled (~40 requests):
    function packUmd(pkgName) {
        packages['@angular/'+ pkgName] = { main: pkgName + '.umd' };
    };
    // Most environments should use UMD; some (Karma) need the individual index files
    var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;
    // Add package entries for angular packages
    ngPackageNames.forEach(setPackageConfig);
    var config = {
        map: map,
        packages: packages
    }
    System.config(config);
})(this);
