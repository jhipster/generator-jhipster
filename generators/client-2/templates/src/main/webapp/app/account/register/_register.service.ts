Register.$inject = ['$resource'];

export function Register ($resource) {
    return $resource(<% if(authenticationType === 'uaa') { %>'<%= uaaBaseName.toLowerCase() %>/api/register'<%} else { %>'api/register'<% } %>, {}, {});
}
