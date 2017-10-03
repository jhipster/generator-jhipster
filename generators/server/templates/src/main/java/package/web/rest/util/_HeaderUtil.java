<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
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
        log.error("Entity processing failed, {}", defaultMessage);
        HttpHeaders headers = new HttpHeaders();
        headers.add("X-<%=angularAppName%>-error", <%- errorMessage %>);
        headers.add("X-<%=angularAppName%>-params", entityName);
        return headers;
    }
}
