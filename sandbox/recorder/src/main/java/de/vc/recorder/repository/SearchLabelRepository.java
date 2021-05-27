package de.vc.recorder.repository;

import de.vc.recorder.domain.SearchLabel;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the SearchLabel entity.
 */
@Repository
public interface SearchLabelRepository extends JpaRepository<SearchLabel, Long> {
    @Query(
        value = "select distinct searchLabel from SearchLabel searchLabel left join fetch searchLabel.records",
        countQuery = "select count(distinct searchLabel) from SearchLabel searchLabel"
    )
    Page<SearchLabel> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct searchLabel from SearchLabel searchLabel left join fetch searchLabel.records")
    List<SearchLabel> findAllWithEagerRelationships();

    @Query("select searchLabel from SearchLabel searchLabel left join fetch searchLabel.records where searchLabel.id =:id")
    Optional<SearchLabel> findOneWithEagerRelationships(@Param("id") Long id);
}
