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
        'angular-ui-router': 'vendor/angular-ui-router/release/angular-ui-router.js',
        'ui-router-ng2': 'vendor/ui-router-ng2/_bundles/ui-router-ng2.js',
        'ui-router-ng1-to-ng2': 'vendor/ui-router-ng1-to-ng2/ng1-to-ng2.js',
        'ui-router-visualizer': 'vendor/ui-router-visualizer/release/visualizer.min.js',
        'jquery' : 'vendor/jquery/dist',
        'ng2-webstorage': 'vendor/ng2-webstorage',
        <%_ if (enableTranslation){ _%>
        'ng2-translate': 'vendor/ng2-translate/bundles',
        <%_ } _%>
        'css' : 'vendor/systemjs-plugin-css/css.js',
        // app barrels
        'account' : 'app/account',
        'admin' : 'app/admin',
        'components' : 'app/components',
        'home' : 'app/home',
        'layouts' : 'app/layouts',
        'shared' : 'app/shared'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app': { main: 'app.main' },
        'rxjs': {},
        '@ng-bootstrap/ng-bootstrap': { main: '/bundles/ng-bootstrap', defaultExtension: 'js' },
        'ui-router-ng2': {},
        'jquery': { main: 'jquery.min', defaultExtension: 'js' },
        'ng2-webstorage': { main: 'bundles/core.umd.js', defaultExtension: 'js' },
        <%_ if (enableTranslation){ _%>
        'ng2-translate': {main: 'ng2-translate', defaultExtension: 'js'},
        <%_ } _%>
        // app barrels
        'account' : { main: 'index',  defaultExtension: 'js' },
        'admin' : { main: 'index',  defaultExtension: 'js' },
        'components' : { main: 'index',  defaultExtension: 'js' },
        'home' : { main: 'index',  defaultExtension: 'js' },
        'layouts' : { main: 'index',  defaultExtension: 'js' },
        'shared' : { main: 'index',  defaultExtension: 'js' }
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
    }
    // Most environments should use UMD; some (Karma) need the individual index files
    var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;
    // Add package entries for angular packages
    ngPackageNames.forEach(setPackageConfig);

    var config = {
        map: map,
        packages: packages
    };

    // Allow imports from "angular" even though it's loaded as a <script>
    // This is similar to webpack `externals: []`
    System.set('angular', System.newModule(window.angular));
    System.config(config);
})(this);
