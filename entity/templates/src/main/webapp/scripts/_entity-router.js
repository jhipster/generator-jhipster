'use strict';

<%= angularAppName %>
    .config(function ($routeProvider, $httpProvider, $translateProvider, USER_ROLES) {
            $routeProvider
                .when('/<%= entityInstance %>', {
                    templateUrl: 'views/<%= entityInstance %>s.html',
                    controller: '<%= entityClass %>Controller',
                    resolve:{
                        resolved<%= entityClass %>: ['<%= entityClass %>', function (<%= entityClass %>) {
                            return <%= entityClass %>.query();
                        }]
                    },
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
        });
