PasswordResetFinish.$inject = ['$resource'];

export function PasswordResetFinish($resource) {
    var service = $resource(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/account/reset_password/finish'<%} else { %>'api/account/reset_password/finish'<% } %>, {}, {});

    return service;
}
