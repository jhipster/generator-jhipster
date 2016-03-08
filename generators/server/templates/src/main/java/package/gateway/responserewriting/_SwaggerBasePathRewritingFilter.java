package <%=packageName%>.gateway.responserewriting;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.io.CharStreams;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.netflix.zuul.filters.post.SendResponseFilter;

import java.io.*;
import java.util.LinkedHashMap;

/**
 * Zuul filter to rewrite micro-services Swagger URL Base Path.
 */
public class SwaggerBasePathRewritingFilter extends SendResponseFilter {

    private final Logger log = LoggerFactory.getLogger(SwaggerBasePathRewritingFilter.class);

    @Override
    public String filterType() {
        return "post";
    }

    @Override
    public int filterOrder() {
        return 100;
    }

    /**
     * Filter requests to micro-services Swagger docs.
     */
    @Override
    public boolean shouldFilter() {
        return RequestContext.getCurrentContext().getRequest().getRequestURI().endsWith("/v2/api-docs");
    }

    @Override
    public Object run() {
        RequestContext context = RequestContext.getCurrentContext();
        context.getResponse().setCharacterEncoding("UTF-8");

        String rewrittenResponse = rewriteBasePath(context);
        context.setResponseBody(rewrittenResponse);
        return null;
    }

    private String rewriteBasePath(RequestContext context) {
        InputStream responseDataStream = context.getResponseDataStream();
        String requestUri = RequestContext.getCurrentContext().getRequest().getRequestURI();
        try {
            String response = CharStreams.toString(new InputStreamReader(responseDataStream));
            if (response != null) {
                ObjectMapper mapper = new ObjectMapper();
                LinkedHashMap<String, Object> map = mapper.readValue(response, LinkedHashMap.class);

                String basePath = requestUri.replace("/v2/api-docs","");
                map.put("basePath",basePath);
                log.debug("Swagger-docs: rewritten Base URL with correct micro-service route: {}", basePath);
                return mapper.writeValueAsString(map);
            }
        }
        catch (IOException e){
            log.error("Swagger-docs filter error: {}", e.getMessage(), e);
        }
        return null;
    }
}
