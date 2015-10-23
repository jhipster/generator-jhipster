(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>.<%= entityClass %>')
        .controller('<%= entityClass %>DetailController', controller);

    controller.$inject = ['$rootScope',
        'entity'<% for (idx in differentTypes) { %>,
        '<%= differentTypes[idx] %>'<% } %>];
    /* @ngInject */
    function controller($rootScope,
        entity<% for (idx in differentTypes) { %>,
        <%= differentTypes[idx] %><% } %>){

        var vm = this;
        vm.<%= entityInstance %> = entity;

        activate();
        function activate() {

        }

        vm.load = function (id) {
            <%= entityClass %>.get({id: id}, function(result) {
                vm.<%= entityInstance %> = result;
            });
        };

        var unsubscribe = $rootScope.$on('<%=angularAppName%>:<%= entityInstance %>Update', function(event, result) {
            vm.<%= entityInstance %> = result;
        });

        <%_ if (fieldsContainBlob) { _%>

        vm.byteSize = function (base64String) {
            if (!angular.isString(base64String)) {
                return '';
            }
            function endsWith(suffix, str) {
                return str.indexOf(suffix, str.length - suffix.length) !== -1;
            }
            function paddingSize(base64String) {
                if (endsWith('==', base64String)) {
                    return 2;
                }
                if (endsWith('=', base64String)) {
                    return 1;
                }
                return 0;
            }
            function size(base64String) {
                return base64String.length / 4 * 3 - paddingSize(base64String);
            }
            function formatAsBytes(size) {
                return size.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " bytes";
            }

            return formatAsBytes(size(base64String));
        };
        <%_ } _%>
    }
})();

