'use strict';

angular.module('<%=angularAppName%>')
    .controller('<%= entityClass %>Controller', function ($scope, $state, <%= entityClass %><% if (searchEngine == 'elasticsearch') { %>, <%= entityClass %>Search<% } %><% if (pagination != 'no') { %>, ParseLinks<% } %>) {
        $scope.<%= entityInstance %>s = [];
        <%_ if (pagination == 'pager' || pagination == 'pagination') { _%>
        $scope.page = 0;
        $scope.loadAll = function() {
            <%= entityClass %>.query({page: $scope.page, size: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                $scope.<%= entityInstance %>s = result;
                $scope.total = headers('x-total-count');				
            });
        };
        <%_ } _%>
        <%_ if (pagination == 'infinite-scroll') { _%>
        $scope.page = 0;
        $scope.loadAll = function() {
            <%= entityClass %>.query({page: $scope.page, size: 20}, function(result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
                for (var i = 0; i < result.length; i++) {
                    $scope.<%= entityInstance %>s.push(result[i]);
                }
            });
        };
        $scope.reset = function() {
            $scope.page = 0;
            $scope.<%= entityInstance %>s = [];
            $scope.loadAll();
        };
        <%_ } _%>
        <%_ if (pagination != 'no') { _%>
        $scope.loadPage = function(page) {
            $scope.page = page;
            $scope.loadAll();
        };
        <%_ } _%>
        <%_ if (pagination == 'no') { _%>
        $scope.loadAll = function() {
            <%= entityClass %>.query(function(result) {
               $scope.<%= entityInstance %>s = result;
            });
        };
        <%_ } _%>
        $scope.loadAll();

        $scope.delete = function (id) {
            <%= entityClass %>.get({id: id}, function(result) {
                $scope.<%= entityInstance %> = result;
                $('#delete<%= entityClass %>Confirmation').modal('show');
            });
        };

        $scope.confirmDelete = function (id) {
            <%= entityClass %>.delete({id: id},
                function () {
                    <%_ if (pagination != 'infinite-scroll') { _%>
                    $scope.loadAll();
                    <%_ } else { _%>
                    $scope.reset();
                    <%_ } _%>
                    $('#delete<%= entityClass %>Confirmation').modal('hide');
                    $scope.clear();
                });
        };
        <%_ if (searchEngine == 'elasticsearch') { _%>

        $scope.search = function () {
            <%= entityClass %>Search.query({query: $scope.searchQuery}, function(result) {
                $scope.<%= entityInstance %>s = result;
            }, function(response) {
                if(response.status === 404) {
                    $scope.loadAll();
                }
            });
        };
        <%_ } _%>

        $scope.refresh = function () {
            <%_ if (pagination != 'infinite-scroll') { _%>
            $scope.loadAll();
            <%_ } else { _%>
            $scope.reset();
            <%_ } _%>
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.<%= entityInstance %> = {
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

        $scope.abbreviate = function (text) {
            if (!angular.isString(text)) {
                return '';
            }
            if (text.length < 30) {
                return text;
            }
            return text ? (text.substring(0, 15) + '...' + text.slice(-10)) : '';
        };

        $scope.byteSize = function (base64String) {
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
	        
		//==================|
		// bulk actions		|
		//==================|
        $scope.areAll<%= entityClass %>sSelected = false;
		
        $scope.update<%= entityClass %>sSelection = function (<%= entityInstance %>Array, selectionValue) {
            for (var i = 0; i < <%= entityInstance %>Array.length; i++)
            {
                <%= entityInstance %>Array[i].isSelected = selectionValue;
            }
        };
		
        $scope.export = function () {
            for (var i = 0; i < $scope.<%= entityInstance %>s.length; i++) {
                var <%= entityInstance %> = $scope.<%= entityInstance %>s[i];
                console.info('TODO: export selected item with id: ' + <%= entityInstance %>.id);
            }
        };

        $scope.import = function () {
            for (var i = 0; i < $scope.<%= entityInstance %>s.length; i++) {
                var <%= entityInstance %> = $scope.<%= entityInstance %>s[i];
                console.info('TODO: import selected item with id: ' + <%= entityInstance %>.id);
            }
        };
		
        $scope.deleteSelected = function (){
            for (var i = 0; i < $scope.<%= entityInstance %>s.length; i++){
                var <%= entityInstance %> = $scope.<%= entityInstance %>s[i];
                if(<%= entityInstance %>.isSelected){
                    <%= entityClass %>.delete(cat);
                }
            }
            $state.go('<%= entityInstance %>', null, {reload: true});
        };
		
        $scope.sync = function (){
            for (var i = 0; i < $scope.<%= entityInstance %>s.length; i++){
                var <%= entityInstance %> = $scope.<%= entityInstance %>s[i];
                if(<%= entityInstance %>.isSelected){
                    <%= entityClass %>.update(<%= entityInstance %>);
                }
            }
        };

        $scope.order = function (predicate, reverse) {
            $scope.predicate = predicate;
            $scope.reverse = reverse;
            <%= entityClass %>.query({page: $scope.page, size: 20}, function (result, headers) {
                $scope.links = ParseLinks.parse(headers('link'));
				$scope.<%= entityInstance %>s = result;
                $scope.total = headers('x-total-count');
            });
        };
		
		
    });
