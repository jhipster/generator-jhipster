package <%=packageName%>.repository;

import <%=packageName%>.domain.User;
import org.springframework.dao.DataAccessException;
import org.springframework.data.repository.Repository;

/**
 * Spring Data JPA repository for the User entity.
 */
public interface UserRepository extends Repository<User, String> {

	User findByLogin(String login) throws DataAccessException;
	
}
