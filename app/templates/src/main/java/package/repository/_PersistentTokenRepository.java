package <%=packageName%>.repository;

import <%=packageName%>.domain.PersistentToken;
import <%=packageName%>.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * Spring Data JPA repository for the User entity.
 */
public interface PersistentTokenRepository extends JpaRepository<PersistentToken, String> {

    PersistentToken findBySeries(String series);

    List<PersistentToken> findByUser(User user);

}
