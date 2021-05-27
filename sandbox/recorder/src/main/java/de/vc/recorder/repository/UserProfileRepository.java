package de.vc.recorder.repository;

import de.vc.recorder.domain.UserProfile;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the UserProfile entity.
 */
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    @Query(
        value = "select distinct userProfile from UserProfile userProfile left join fetch userProfile.assignedNodes left join fetch userProfile.assignedCategories left join fetch userProfile.machineLabels",
        countQuery = "select count(distinct userProfile) from UserProfile userProfile"
    )
    Page<UserProfile> findAllWithEagerRelationships(Pageable pageable);

    @Query(
        "select distinct userProfile from UserProfile userProfile left join fetch userProfile.assignedNodes left join fetch userProfile.assignedCategories left join fetch userProfile.machineLabels"
    )
    List<UserProfile> findAllWithEagerRelationships();

    @Query(
        "select userProfile from UserProfile userProfile left join fetch userProfile.assignedNodes left join fetch userProfile.assignedCategories left join fetch userProfile.machineLabels where userProfile.id =:id"
    )
    Optional<UserProfile> findOneWithEagerRelationships(@Param("id") Long id);
}
