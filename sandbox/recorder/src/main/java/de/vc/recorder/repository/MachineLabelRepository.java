package de.vc.recorder.repository;

import de.vc.recorder.domain.MachineLabel;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the MachineLabel entity.
 */
@Repository
public interface MachineLabelRepository extends JpaRepository<MachineLabel, Long> {
    @Query(
        value = "select distinct machineLabel from MachineLabel machineLabel left join fetch machineLabel.records",
        countQuery = "select count(distinct machineLabel) from MachineLabel machineLabel"
    )
    Page<MachineLabel> findAllWithEagerRelationships(Pageable pageable);

    @Query("select distinct machineLabel from MachineLabel machineLabel left join fetch machineLabel.records")
    List<MachineLabel> findAllWithEagerRelationships();

    @Query("select machineLabel from MachineLabel machineLabel left join fetch machineLabel.records where machineLabel.id =:id")
    Optional<MachineLabel> findOneWithEagerRelationships(@Param("id") Long id);
}
