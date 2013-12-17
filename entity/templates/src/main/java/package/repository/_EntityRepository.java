package <%=packageName%>.repository;

import <%=packageName%>.domain.<%= entityClass %>;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for the <%= entityClass %> entity.
 */
public interface <%= entityClass %>Repository extends JpaRepository<<%= entityClass %>, Long> {

}
