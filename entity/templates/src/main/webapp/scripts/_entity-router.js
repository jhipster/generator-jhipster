'use strict';

<%= angularAppName %>
    .config(function ($secureRouteProvider, $httpProvider, $translateProvider, USER_ROLES) {
            $secureRouteProvider
                .whenAuthenticated('/<%= entityInstance %>', {
                    templateUrl: 'views/<%= entityInstance %>s.html',
                    controller: '<%= entityClass %>Controller',
                    resolve:{
                        resolved<%= entityClass %>: ['<%= entityClass %>', function (<%= entityClass %>) {
                            return <%= entityClass %>.query().$promise;
                        }]<% for (relationshipId in relationships) {
                            var relationshipClass = relationships[relationshipId].otherEntityNameCapitalized;%>,
                        resolved<%=relationshipClass%>: ['<%=relationshipClass%>', function (<%=relationshipClass%>) {
                            return <%=relationshipClass%>.query().$promise;
                        }]<% } %>
                    },
                    access: {
                        authorizedRoles: [USER_ROLES.all]
                    }
                })
        });
