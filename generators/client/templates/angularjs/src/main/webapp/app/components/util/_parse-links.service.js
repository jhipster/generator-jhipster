<%#
 Copyright 2013-2018 the original author or authors from the JHipster project.

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
(function(){
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .factory('ParseLinks', ParseLinks);

    function ParseLinks () {

        var service = {
            parse : parse
        };

        return service;

        function parse(header) {
            if (header.length === 0) {
                throw new Error('input must not be of zero length');
            }

            // Split parts by comma
            var parts = header.split(',');
            var links = {};
            // Parse each part into a named link
            angular.forEach(parts, function(p) {
                var section = p.split('>;');
                if (section.length !== 2) {
                    throw new Error('section could not be split on ">;"');
                }
                var url = section[0].replace(/<(.*)/, '$1').trim();
                var queryString = {};
                url.replace(
                    new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
                    function($0, $1, $2, $3) { queryString[$1] = $3; }
                );
                var page = queryString.page;
                if (angular.isString(page)) {
                    page = parseInt(page);
                }
                var name = section[1].replace(/rel="(.*)"/, '$1').trim();
                links[name] = page;
            });
            return links;
        }
    }
})();
