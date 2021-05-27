package de.vc.recorder.web.rest;

import de.vc.recorder.domain.MachineLabel;
import de.vc.recorder.repository.MachineLabelRepository;
import de.vc.recorder.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link de.vc.recorder.domain.MachineLabel}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class MachineLabelResource {

    private final Logger log = LoggerFactory.getLogger(MachineLabelResource.class);

    private static final String ENTITY_NAME = "recorderMachineLabel";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final MachineLabelRepository machineLabelRepository;

    public MachineLabelResource(MachineLabelRepository machineLabelRepository) {
        this.machineLabelRepository = machineLabelRepository;
    }

    /**
     * {@code POST  /machine-labels} : Create a new machineLabel.
     *
     * @param machineLabel the machineLabel to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new machineLabel, or with status {@code 400 (Bad Request)} if the machineLabel has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/machine-labels")
    public ResponseEntity<MachineLabel> createMachineLabel(@Valid @RequestBody MachineLabel machineLabel) throws URISyntaxException {
        log.debug("REST request to save MachineLabel : {}", machineLabel);
        if (machineLabel.getId() != null) {
            throw new BadRequestAlertException("A new machineLabel cannot already have an ID", ENTITY_NAME, "idexists");
        }
        MachineLabel result = machineLabelRepository.save(machineLabel);
        return ResponseEntity
            .created(new URI("/api/machine-labels/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /machine-labels/:id} : Updates an existing machineLabel.
     *
     * @param id the id of the machineLabel to save.
     * @param machineLabel the machineLabel to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated machineLabel,
     * or with status {@code 400 (Bad Request)} if the machineLabel is not valid,
     * or with status {@code 500 (Internal Server Error)} if the machineLabel couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/machine-labels/{id}")
    public ResponseEntity<MachineLabel> updateMachineLabel(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody MachineLabel machineLabel
    ) throws URISyntaxException {
        log.debug("REST request to update MachineLabel : {}, {}", id, machineLabel);
        if (machineLabel.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, machineLabel.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!machineLabelRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        MachineLabel result = machineLabelRepository.save(machineLabel);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, machineLabel.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /machine-labels/:id} : Partial updates given fields of an existing machineLabel, field will ignore if it is null
     *
     * @param id the id of the machineLabel to save.
     * @param machineLabel the machineLabel to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated machineLabel,
     * or with status {@code 400 (Bad Request)} if the machineLabel is not valid,
     * or with status {@code 404 (Not Found)} if the machineLabel is not found,
     * or with status {@code 500 (Internal Server Error)} if the machineLabel couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/machine-labels/{id}", consumes = "application/merge-patch+json")
    public ResponseEntity<MachineLabel> partialUpdateMachineLabel(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody MachineLabel machineLabel
    ) throws URISyntaxException {
        log.debug("REST request to partial update MachineLabel partially : {}, {}", id, machineLabel);
        if (machineLabel.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, machineLabel.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!machineLabelRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<MachineLabel> result = machineLabelRepository
            .findById(machineLabel.getId())
            .map(
                existingMachineLabel -> {
                    if (machineLabel.getName() != null) {
                        existingMachineLabel.setName(machineLabel.getName());
                    }
                    if (machineLabel.getValue() != null) {
                        existingMachineLabel.setValue(machineLabel.getValue());
                    }

                    return existingMachineLabel;
                }
            )
            .map(machineLabelRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, machineLabel.getId().toString())
        );
    }

    /**
     * {@code GET  /machine-labels} : get all the machineLabels.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of machineLabels in body.
     */
    @GetMapping("/machine-labels")
    public List<MachineLabel> getAllMachineLabels(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all MachineLabels");
        return machineLabelRepository.findAllWithEagerRelationships();
    }

    /**
     * {@code GET  /machine-labels/:id} : get the "id" machineLabel.
     *
     * @param id the id of the machineLabel to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the machineLabel, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/machine-labels/{id}")
    public ResponseEntity<MachineLabel> getMachineLabel(@PathVariable Long id) {
        log.debug("REST request to get MachineLabel : {}", id);
        Optional<MachineLabel> machineLabel = machineLabelRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(machineLabel);
    }

    /**
     * {@code DELETE  /machine-labels/:id} : delete the "id" machineLabel.
     *
     * @param id the id of the machineLabel to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/machine-labels/{id}")
    public ResponseEntity<Void> deleteMachineLabel(@PathVariable Long id) {
        log.debug("REST request to delete MachineLabel : {}", id);
        machineLabelRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
