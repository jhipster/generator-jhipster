/**
 * JPA domain objects.
 */
package <%=packageName%>.domain<% if(prodDatabaseType != 'none') { %>.jpa<% } %><% if(prodDatabaseType == 'none' && nosqlDatabaseType == 'mongodb') { %>.mongodb<% } %>;
