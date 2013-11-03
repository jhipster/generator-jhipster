package <%=packageName%>.repository;

import <%=packageName%>.domain.PersistentToken;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for the User entity.
 */
public interface PersistentTokenRepository extends JpaRepository<PersistentToken, String> {

    PersistentToken findBySeries(String series);

}
