package <%=packageName%>.repository.custom;


    import java.util.Optional;

    import org.springframework.data.repository.CrudRepository;
    import org.springframework.data.repository.Repository;

/**
 * Repository to manage {@link Customer} instances.
 *
 * @author Fabrice Sznajderman
 */
public interface Java8MongoRepository<T, ID> extends Repository<T, ID> {

    Optional<T> findOne(ID id);

    Optional<T> findByLastname(String lastname);


}
