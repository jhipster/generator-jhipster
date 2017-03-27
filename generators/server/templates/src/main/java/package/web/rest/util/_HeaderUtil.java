package <%=packageName%>.web.rest.util;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
<%_
let createdMessage;
let updatedMessage;
let deletedMessage;
let errorMessage;
_%>
/**
 * Utility class for HTTP headers creation.
 */
public final class HeaderUtil {

    private static final Logger log = LoggerFactory.getLogger(HeaderUtil.class);
    <%_ if (enableTranslation) { _%>

    private static final String APPLICATION_NAME = "<%= angularAppName %>";
    <%_ } _%>

    private HeaderUtil() {
    }

    public static HttpHeaders createAlert(String message, String param) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-<%=angularAppName%>-alert", message);
        headers.add("X-<%=angularAppName%>-params", param);
        return headers;
    }
<%
    if (enableTranslation) {
        createdMessage = 'APPLICATION_NAME + "." + entityName + ".created"';
        updatedMessage = 'APPLICATION_NAME + "." + entityName + ".updated"';
        deletedMessage = 'APPLICATION_NAME + "." + entityName + ".deleted"';
        errorMessage = '"error." + errorKey';
    } else {
        createdMessage = '"A new " + entityName + " is created with identifier " + param';
        updatedMessage = '"A " + entityName + " is updated with identifier " + param';
        deletedMessage = '"A " + entityName + " is deleted with identifier " + param';
        errorMessage = 'defaultMessage';
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
        log.error("Entity creation failed, {}", defaultMessage);
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-<%=angularAppName%>-error", <%- errorMessage %>);
        headers.add("X-<%=angularAppName%>-params", entityName);
        return headers;
    }
}
