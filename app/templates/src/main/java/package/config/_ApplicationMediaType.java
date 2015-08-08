package <%=packageName%>.config;

import org.springframework.http.MediaType;

/**
 * Defines application specific MIME types.
 */
public interface ApplicationMediaType {

    MediaType APPLICATION_JSON_V1 = new MediaType("application", "vnd.<%=baseName%>.v1+json");

    String APPLICATION_JSON_V1_VALUE = "application/vnd.<%=baseName%>.v1+json";

    MediaType TEXT_PLAIN_V1 = new MediaType("text", "vnd.<%=baseName%>.v1+plain");

    String TEXT_PLAIN_V1_VALUE = "text/vnd.<%=baseName%>.v1+plain";
}
