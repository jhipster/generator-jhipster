package com.mycompany.myapp.web.filter.gzip;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.zip.GZIPOutputStream;

public class GZipServletFilter implements Filter {

    private Logger log = LoggerFactory.getLogger(GZipServletFilter.class);

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // Nothing to initialize
    }

    @Override
    public void destroy() {
        // Nothing to destroy
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {

        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        if (!isIncluded(httpRequest) && acceptsGZipEncoding(httpRequest) && !response.isCommitted()) {
            // Client accepts zipped content
            if (log.isTraceEnabled()) {
                log.trace("{} Written with gzip compression", httpRequest.getRequestURL());
            }

            // Create a gzip stream
            final ByteArrayOutputStream compressed = new ByteArrayOutputStream();
            final GZIPOutputStream gzout = new GZIPOutputStream(compressed);

            // Handle the request
            final GZipServletResponseWrapper wrapper = new GZipServletResponseWrapper(httpResponse, gzout);
            wrapper.setDisableFlushBuffer(true);
            chain.doFilter(request, wrapper);
            wrapper.flush();

            gzout.close();

            // double check one more time before writing out
            // repsonse might have been committed due to error
            if (response.isCommitted()) {
                return;
            }

            // return on these special cases when content is empty or unchanged
            switch (wrapper.getStatus()) {
                case HttpServletResponse.SC_NO_CONTENT:
                case HttpServletResponse.SC_RESET_CONTENT:
                case HttpServletResponse.SC_NOT_MODIFIED:
                    return;
                default:
            }

            // Saneness checks
            byte[] compressedBytes = compressed.toByteArray();
            boolean shouldGzippedBodyBeZero = GZipResponseUtil.shouldGzippedBodyBeZero(compressedBytes, httpRequest);
            boolean shouldBodyBeZero = GZipResponseUtil.shouldBodyBeZero(httpRequest, wrapper.getStatus());
            if (shouldGzippedBodyBeZero || shouldBodyBeZero) {
                // No reason to add GZIP headers or write body if no content was written or status code specifies no
                // content
                response.setContentLength(0);
                return;
            }

            // Write the zipped body
            GZipResponseUtil.addGzipHeader(httpResponse);

            response.setContentLength(compressedBytes.length);

            response.getOutputStream().write(compressedBytes);

        } else {
            // Client does not accept zipped content - don't bother zipping
            if (log.isTraceEnabled()) {
                log.trace("{} Written without gzip compression because the request does not accept gzip", httpRequest.getRequestURL());
            }
            chain.doFilter(request, response);
        }
    }

    /**
     * Checks if the request uri is an include. These cannot be gzipped.
     */
    private boolean isIncluded(final HttpServletRequest request) {
        String uri = (String) request.getAttribute("javax.servlet.include.request_uri");
        boolean includeRequest = !(uri == null);
        if (includeRequest && log.isDebugEnabled()) {
            log.debug("{} resulted in an include request. This is unusable, because"
                    + "the response will be assembled into the overrall response. Not gzipping.",
                    request.getRequestURL());
        }
        return includeRequest;
    }

    private boolean acceptsGZipEncoding(HttpServletRequest httpRequest) {
        String acceptEncoding = httpRequest.getHeader("Accept-Encoding");
        return acceptEncoding != null && acceptEncoding.contains("gzip");
    }
}
