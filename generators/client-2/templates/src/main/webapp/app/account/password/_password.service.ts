Password.$inject = ['$resource'];

export function Password($resource) {
    var service = $resource(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/account/change_password'<%} else { %>'api/account/change_password'<% } %>, {}, {});

    return service;
}
