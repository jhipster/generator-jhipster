<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
'use strict';

var gulp = require('gulp'),
    util = require('./utils'),
    url = require('url'),
    browserSync = require('browser-sync'),
    proxy = require('proxy-middleware');

var config = require('./config');

module.exports = function () {
    var baseUri = config.uri + config.apiPort;
    // Routes to proxy to the backend. Routes ending with a / will setup
    // a redirect so that if accessed without a trailing slash, will
    // redirect. This is required for some endpoints for proxy-middleware
    // to correctly handle them.
    var proxyRoutes = [
    <%_ if (applicationType === 'monolith') { _%>
      <%_ if (authenticationType === 'oauth2') { _%>
        '/oauth',
      <%_ } _%>
        '/api',
        '/management',
        '/swagger-resources',
        '/v2/api-docs',
        '/h2-console'
    <%_ } else { _%>
        '/'
    <%_ } _%>
    ];

    var requireTrailingSlash = proxyRoutes.filter(function (r) {
        return util.endsWith(r, '/');
    }).map(function (r) {
        // Strip trailing slash so we can use the route to match requests
        // with non trailing slash
        return r.substr(0, r.length - 1);
    });

    var proxies = [
        // Ensure trailing slash in routes that require it
        function (req, res, next) {
            requireTrailingSlash.forEach(function (route){
                if (url.parse(req.url).path === route) {
                    res.statusCode = 301;
                    res.setHeader('Location', route + '/');
                    res.end();
                }
            });

            next();
        }
    ]
    .concat(
        // Build a list of proxies for routes: [route1_proxy, route2_proxy, ...]
        proxyRoutes.map(function (r) {
            var options = url.parse(baseUri + r);
            options.route = r;
            options.preserveHost = true;
            return proxy(options);
        }));

    browserSync({
        open: true,
        port: config.port,
        server: {
            baseDir: config.app,
            middleware: proxies
        }
    });

    gulp.start('watch');
};
