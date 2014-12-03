package <%=packageName%>.repository.custom;


    import java.util.Optional;

    import org.springframework.data.repository.CrudRepository;
    import org.springframework.data.repository.Repository;

/**
 * Repository to manage T instances.
 *
 * @author Fabrice Sznajderman
 */
public interface Java8JpaRepository<T, ID> {



    <T> T save(T t);

    <T> void delete(T t);


}
