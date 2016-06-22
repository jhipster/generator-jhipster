Activate.$inject = ['$resource'];

export function Activate ($resource) {
    var service = $resource(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/activate'<%} else { %>'api/activate'<% } %>, {}, {
        'get': { method: 'GET', params: {}, isArray: false}
    });

    return service;
}
