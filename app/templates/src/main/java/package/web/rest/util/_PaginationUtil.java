package <%=packageName%>.web.rest.util;

import java.net.URI;
import java.net.URISyntaxException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;

import <%=packageName%>.web.rest.dto.PageDTO;

/**
 * Utility class for handling pagination.
 *
 * <p>
 * Pagination uses the same principles as the <a href="https://developer.github.com/v3/#pagination">Github API</api>,
 * and follow <a href="http://tools.ietf.org/html/rfc5988">RFC 5988 (Link header)</a>.
 * </p>
 */
public class PaginationUtil {

    public static final int DEFAULT_OFFSET = 1;

    public static final int MIN_OFFSET = 1;

    public static final int DEFAULT_LIMIT = 20;

    public static final int MAX_LIMIT = 100;

    public static Pageable generatePageRequest(Integer offset, Integer limit) {
        return generatePageRequest(offset, limit, null);
    }

    public static Pageable generatePageRequest(Integer offset, Integer limit, Sort sort) {
        if (offset == null || offset < MIN_OFFSET) {
            offset = DEFAULT_OFFSET;
        }
        if (limit == null || limit > MAX_LIMIT) {
            limit = DEFAULT_LIMIT;
        }
        return new PageRequest(offset - 1, limit, sort);
    }

    public static HttpHeaders generatePaginationHttpHeaders(Page<?> page, String baseUrl) throws URISyntaxException {
        return generatePaginationHttpHeaders(baseUrl, page.getTotalElements(), page.getTotalPages(), page.getNumber(), page.getSize());
    }

    public static HttpHeaders generatePaginationHttpHeaders(PageDTO<?> page, String baseUrl) throws URISyntaxException {
        return generatePaginationHttpHeaders(baseUrl, page.getTotalElements(), page.getTotalPages(), page.getCurrentPageNumber(), page.getSize());
    }

    public static HttpHeaders generatePaginationHttpHeaders(String baseUrl, long totalElements, int totalPages, int pageNumber, int pageSize)
        throws URISyntaxException {

        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Total-Count", "" + totalElements);
        String link = "";
        if ((pageNumber + 1) < totalPages) {
            link = "<" + (new URI(baseUrl + "?page=" + (pageNumber + 1) + "&size=" + pageSize)).toString() + ">; rel=\"next\",";
        }
        // prev link
        if (pageNumber > 0) {
            link += "<" + (new URI(baseUrl + "?page=" + (pageNumber - 1) + "&size=" + pageSize)).toString() + ">; rel=\"prev\",";
        }
        // last and first link
        link += "<" + (new URI(baseUrl + "?page=" + (totalPages - 1) + "&size=" + pageSize)).toString() + ">; rel=\"last\",";
        link += "<" + (new URI(baseUrl + "?page=" + 0 + "&size=" + pageSize)).toString() + ">; rel=\"first\"";
        headers.add(HttpHeaders.LINK, link);
        return headers;
    }

}
