package <%=packageName%>.web.filter;

import javax.servlet.*;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * This filter is used in production, to put HTTP cache headers with a long (1 month) expiration time.
 * </p>
 */
public class CachingHttpHeadersFilter implements Filter {

    // Cache period is 1 month
    private static long CACHE_PERIOD = 31 * 24 * 60 * 60;

    // We consider the last modified date is the start up time of the server
    private static long LAST_MODIFIED = System.currentTimeMillis();

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
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Setting Expires header, for proxy caching
        httpResponse.setDateHeader("Expires", CACHE_PERIOD + System.currentTimeMillis());

        // Setting the Last-Modified header, for browser caching
        httpResponse.setDateHeader("Last-Modified", LAST_MODIFIED);
    }
}
