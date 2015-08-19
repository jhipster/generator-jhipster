package <%=packageName%>.config;

import org.springframework.http.MediaType;

/**
 * Defines application specific MIME types.
 */
public final class ApplicationMediaType {

    public static final MediaType APPLICATION_JSON;

    public static final String APPLICATION_JSON_VALUE = <% if(versionApi) { %>"application/vnd.<%=baseName%>.v1+json"<% } else { %>MediaType.APPLICATION_JSON_VALUE<% } %>;

    public static final MediaType TEXT_PLAIN;

    public static final String TEXT_PLAIN_VALUE = <% if(versionApi) { %>"text/vnd.<%=baseName%>.v1+plain"<% } else { %>MediaType.TEXT_PLAIN_VALUE<% } %>;

    static {
        APPLICATION_JSON = MediaType.parseMediaType(APPLICATION_JSON_VALUE);
        TEXT_PLAIN = MediaType.parseMediaType(TEXT_PLAIN_VALUE);
    }

    private ApplicationMediaType() {
    }
}
