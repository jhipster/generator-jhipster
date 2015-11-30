package <%=packageName%>.web.rest.util;

import org.springframework.http.HttpHeaders;

/**
 * Utility class for http header creation.
 *
 */
public class HeaderUtil {

    public static HttpHeaders createAlert(String message, String param) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-<%=angularAppName%>-alert", message);
        headers.add("X-<%=angularAppName%>-params", param);
        return headers;
    }
<%
    if(enableTranslation) {
        var createdMessage = '"' + angularAppName + '." + entityName + ".created"';
        var updatedMessage = '"' + angularAppName + '." + entityName + ".updated"';
        var deletedMessage = '"' + angularAppName + '." + entityName + ".deleted"';
        var errorMessage = '"error." + errorKey';
    } else {
        var createdMessage = '"A new " + entityName + " is created with identifier " + param';
        var updatedMessage = '"A " + entityName + " is updated with identifier " + param';
        var deletedMessage = '"A " + entityName + " is deleted with identifier " + param';
        var errorMessage = 'defaultMessage';
    }
%>
    public static HttpHeaders createEntityCreationAlert(String entityName, String param) {
        return createAlert(<%- createdMessage %>, param);
    }

    public static HttpHeaders createEntityUpdateAlert(String entityName, String param) {
        return createAlert(<%- updatedMessage %>, param);
    }

    public static HttpHeaders createEntityDeletionAlert(String entityName, String param) {
        return createAlert(<%- deletedMessage %>, param);
    }

    public static HttpHeaders createFailureAlert(String entityName, String errorKey, String defaultMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-<%=angularAppName%>-error", <%- errorMessage %>);
        headers.add("X-<%=angularAppName%>-params", entityName);
        return headers;
    }
}
