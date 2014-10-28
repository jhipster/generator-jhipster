package <%=packageName%>.service.dto;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for storing one page of information for a listing.
 */
public class PageDTO<ENTITY> implements Serializable {

    private static final long serialVersionUID = 1L;
    private final long totalElements;
    private final int size;
    private final int totalPages;
    private final int currentPageNumber;
    private final List<ENTITY> entities;

    public PageDTO(long totalElements, int size, int totalPages, int pageNumber, List<ENTITY> entities) {
        super();
        this.totalElements = totalElements;
        this.size = size;
        this.totalPages = totalPages;
        this.currentPageNumber = pageNumber;
        this.entities = entities;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public int getSize() {
        return size;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public int getCurrentPageNumber() {
        return currentPageNumber;
    }

    public List<ENTITY> getEntities() {
        return entities;
    }

    @Override
    public String toString() {
        return "PageDTO [totalElements=" + totalElements + ", size=" + size + ", totalPages=" + totalPages + ", currentPageNumber=" + currentPageNumber
                + ", entities=" + entities + "]";
    }

}
