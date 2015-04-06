package com.mycompany.myapp.web.filter.gzip;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public final class GZipResponseUtil {

    private static final Logger LOG = LoggerFactory.getLogger(GZipResponseUtil.class);

    /**
     * Gzipping an empty file or stream always results in a 20 byte output
     * This is in java or elsewhere.
     * <p/>
     * On a unix system to reproduce do <code>gzip -n empty_file</code>. -n tells gzip to not
     * include the file name. The resulting file size is 20 bytes.
     * <p/>
     * Therefore 20 bytes can be used indicate that the gzip byte[] will be empty when ungzipped.
     */
    private static final int EMPTY_GZIPPED_CONTENT_SIZE = 20;

    /**
     * Utility class. No public constructor.
     */
    private GZipResponseUtil() {
        // noop
    }

    /**
     * Checks whether a gzipped body is actually empty and should just be zero.
     * When the compressedBytes is {@link #EMPTY_GZIPPED_CONTENT_SIZE} it should be zero.
     *
     * @param compressedBytes the gzipped response body
     * @param request         the client HTTP request
     * @return true if the response should be 0, even if it is isn't.
     */
    public static boolean shouldGzippedBodyBeZero(byte[] compressedBytes, HttpServletRequest request) {

        //Check for 0 length body
        if (compressedBytes.length == EMPTY_GZIPPED_CONTENT_SIZE) {
            if (LOG.isTraceEnabled()) {
                LOG.trace("{} resulted in an empty response.", request.getRequestURL());
            }
            return true;
        } else {
            return false;
        }
    }

    /**
     * Performs a number of checks to ensure response saneness according to the rules of RFC2616:
     * <ol>
     * <li>If the response code is {@link javax.servlet.http.HttpServletResponse#SC_NO_CONTENT} then it is illegal for the body
     * to contain anything. See http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.2.5
     * <li>If the response code is {@link javax.servlet.http.HttpServletResponse#SC_NOT_MODIFIED} then it is illegal for the body
     * to contain anything. See http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html#sec10.3.5
     * </ol>
     *
     * @param request        the client HTTP request
     * @param responseStatus the responseStatus
     * @return true if the response should be 0, even if it is isn't.
     */
    public static boolean shouldBodyBeZero(HttpServletRequest request, int responseStatus) {

        //Check for NO_CONTENT
        if (responseStatus == HttpServletResponse.SC_NO_CONTENT) {
            if (LOG.isDebugEnabled()) {
                LOG.debug("{} resulted in a {} response. Removing message body in accordance with RFC2616.",
                        request.getRequestURL(), HttpServletResponse.SC_NO_CONTENT);
            }
            return true;
        }

        //Check for NOT_MODIFIED
        if (responseStatus == HttpServletResponse.SC_NOT_MODIFIED) {
            if (LOG.isDebugEnabled()) {
                LOG.debug("{} resulted in a {} response. Removing message body in accordance with RFC2616.",
                        request.getRequestURL(), HttpServletResponse.SC_NOT_MODIFIED);
            }
            return true;
        }
        return false;
    }

    /**
     * Adds the gzip HTTP header to the response.
     * <p/>
     * <p>
     * This is need when a gzipped body is returned so that browsers can properly decompress it.
     * </p>
     *
     * @param response the response which will have a header added to it. I.e this method changes its parameter
     * @throws GzipResponseHeadersNotModifiableException Either the response is committed or we were called using the include method
     *                                                   from a {@link javax.servlet.RequestDispatcher#include(javax.servlet.ServletRequest, javax.servlet.ServletResponse)}
     *                                                   method and the set header is ignored.
     */
    public static void addGzipHeader(HttpServletResponse response) throws GzipResponseHeadersNotModifiableException {
        response.setHeader("Content-Encoding", "gzip");
        boolean containsEncoding = response.containsHeader("Content-Encoding");
        if (!containsEncoding) {
            throw new GzipResponseHeadersNotModifiableException("Failure when attempting to set "
                    + "Content-Encoding: gzip");
        }
    }
}
