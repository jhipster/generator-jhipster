package de.vc.recorder.repository;

import de.vc.recorder.domain.CategoryLabel;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the CategoryLabel entity.
 */
@Repository
public interface CategoryLabelRepository extends JpaRepository<CategoryLabel, Long> {
    @Query(
        value = "select distinct categoryLabel from CategoryLabel categoryLabel left join fetch categoryLabel.records",
        countQuery = "select count(distinct categoryLabel) from CategoryLabel categoryLabel"
    )
    Page<CategoryLabel> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct categoryLabel from CategoryLabel categoryLabel left join fetch categoryLabel.records")
    List<CategoryLabel> findAllWithEagerRelationships();

    @Query("select categoryLabel from CategoryLabel categoryLabel left join fetch categoryLabel.records where categoryLabel.id =:id")
    Optional<CategoryLabel> findOneWithEagerRelationships(@Param("id") Long id);
}
