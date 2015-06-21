package <%=packageName%>.web.filter.gzip;

import javax.servlet.ServletException;

public class GzipResponseHeadersNotModifiableException extends ServletException {

    private static final long serialVersionUID = 1L;

    public GzipResponseHeadersNotModifiableException(String message) {
        super(message);
    }
}
