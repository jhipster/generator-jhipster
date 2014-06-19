'use strict';

<%= angularAppName %>.factory('<%= entityClass %>', ['$resource',
    function (Api) {
        var <%= entityInstance %>Service = Api.all('<%= entityInstance %>s/');

        <%= entityClass %>.addRestangularMethod('query', 'get', '');
        <%= entityClass %>.addRestangularMethod('delete', 'remove');

        return <%= entityClass %>;
    }]);
