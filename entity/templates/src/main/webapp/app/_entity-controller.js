(function () {
    'use strict';

    angular
        .module('<%=angularAppName%>')
        .controller('<%= entityClass %>Controller', controller);

    controller.$inject = ['<%= entityClass %>'<% if (searchEngine == 'elasticsearch') { %>,
        '<%= entityClass %>Search \' <% } %><% if (pagination != 'no') { %>,
        'ParseLinks' <% } %>];
    /* @ngInject */
    function controller(<%= entityClass %><% if (searchEngine == 'elasticsearch') { %><%= entityClass %>Search<% } %><% if (pagination != 'no') { %>,
            ParseLinks<% } %>){

            var vm = this;
            vm.<%= entityInstance %>s = [];
            <%_ if (pagination == 'pager' || pagination == 'pagination' || pagination == 'infinite-scroll') { _%>
            vm.page = 0;
             <%_ } _%>

            activate();
            function activate() {

            }

            <%_ if (pagination == 'pager' || pagination == 'pagination') { _%>
            vm.loadAll = function() {
                <%= entityClass %>.query({page: vm.page, size: 20}, function(result, headers) {
                    vm.links = ParseLinks.parse(headers('link'));
                    vm.<%= entityInstance %>s = result;
                });
            };
            <%_ } _%>
            <%_ if (pagination == 'infinite-scroll') { _%>
            vm.loadAll = function() {
                <%= entityClass %>.query({page: vm.page, size: 20}, function(result, headers) {
                    vm.links = ParseLinks.parse(headers('link'));
                    for (var i = 0; i < result.length; i++) {
                        vm.<%= entityInstance %>s.push(result[i]);
                    }
                });
            };
            vm.reset = function() {
                vm.page = 0;
                vm.<%= entityInstance %>s = [];
                vm.loadAll();
            };
            <%_ } _%>
            <%_ if (pagination != 'no') { _%>
            vm.loadPage = function(page) {
                vm.page = page;
                vm.loadAll();
            };
            <%_ } _%>
            <%_ if (pagination == 'no') { _%>
            vm.loadAll = function() {
                <%= entityClass %>.query(function(result) {
                   vm.<%= entityInstance %>s = result;
                });
            };
            <%_ } _%>

            vm.delete = function (id) {
                <%= entityClass %>.get({id: id}, function(result) {
                    vm.<%= entityInstance %> = result;
                    $('#delete<%= entityClass %>Confirmation').modal('show');
                });
            };

            vm.confirmDelete = function (id) {
                <%= entityClass %>.delete({id: id},
                    function () {
                        <%_ if (pagination != 'infinite-scroll') { _%>
                        vm.loadAll();
                        <%_ } else { _%>
                        vm.reset();
                        <%_ } _%>
                        $('#delete<%= entityClass %>Confirmation').modal('hide');
                        vm.clear();
                    });
            };
            <%_ if (searchEngine == 'elasticsearch') { _%>

            vm.search = function () {
                <%= entityClass %>Search.query({query: vm.searchQuery}, function(result) {
                    vm.<%= entityInstance %>s = result;
                }, function(response) {
                    if(response.status === 404) {
                        vm.loadAll();
                    }
                });
            };
            <%_ } _%>

            vm.refresh = function () {
                <%_ if (pagination != 'infinite-scroll') { _%>
                vm.loadAll();
                <%_ } else { _%>
                vm.reset();
                <%_ } _%>
                vm.clear();
            };

            vm.clear = function () {
                vm.<%= entityInstance %> = {
                    <%_ for (fieldId in fields) { _%>
                        <%_ if (fields[fieldId].fieldType == 'Boolean' && fields[fieldId].fieldValidate == true && fields[fieldId].fieldValidateRules.indexOf('required') != -1) { _%>
                    <%= fields[fieldId].fieldName %>: false,
                        <%_ } else { _%>
                    <%= fields[fieldId].fieldName %>: null,
                            <%_ if (fields[fieldId].fieldType == 'byte[]') { _%>
                    <%= fields[fieldId].fieldName %>ContentType: null,
                            <%_ } _%>
                        <%_ } _%>
                    <%_ } _%>
                    id: null
                };
            };
            <%_ if (fieldsContainBlob) { _%>

            vm.abbreviate = function (text) {
                if (!angular.isString(text)) {
                    return '';
                }
                if (text.length < 30) {
                    return text;
                }
                return text ? (text.substring(0, 15) + '...' + text.slice(-10)) : '';
            };

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
