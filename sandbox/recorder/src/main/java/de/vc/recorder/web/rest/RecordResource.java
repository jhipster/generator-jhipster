package de.vc.recorder.web.rest;

import de.vc.recorder.domain.Record;
import de.vc.recorder.repository.RecordRepository;
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
 * REST controller for managing {@link de.vc.recorder.domain.Record}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class RecordResource {

    private final Logger log = LoggerFactory.getLogger(RecordResource.class);

    private static final String ENTITY_NAME = "recorderRecord";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final RecordRepository recordRepository;

    public RecordResource(RecordRepository recordRepository) {
        this.recordRepository = recordRepository;
    }

    /**
     * {@code POST  /records} : Create a new record.
     *
     * @param record the record to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new record, or with status {@code 400 (Bad Request)} if the record has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/records")
    public ResponseEntity<Record> createRecord(@Valid @RequestBody Record record) throws URISyntaxException {
        log.debug("REST request to save Record : {}", record);
        if (record.getId() != null) {
            throw new BadRequestAlertException("A new record cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Record result = recordRepository.save(record);
        return ResponseEntity
            .created(new URI("/api/records/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /records/:id} : Updates an existing record.
     *
     * @param id the id of the record to save.
     * @param record the record to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated record,
     * or with status {@code 400 (Bad Request)} if the record is not valid,
     * or with status {@code 500 (Internal Server Error)} if the record couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/records/{id}")
    public ResponseEntity<Record> updateRecord(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Record record
    ) throws URISyntaxException {
        log.debug("REST request to update Record : {}, {}", id, record);
        if (record.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, record.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!recordRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Record result = recordRepository.save(record);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, record.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /records/:id} : Partial updates given fields of an existing record, field will ignore if it is null
     *
     * @param id the id of the record to save.
     * @param record the record to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated record,
     * or with status {@code 400 (Bad Request)} if the record is not valid,
     * or with status {@code 404 (Not Found)} if the record is not found,
     * or with status {@code 500 (Internal Server Error)} if the record couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/records/{id}", consumes = "application/merge-patch+json")
    public ResponseEntity<Record> partialUpdateRecord(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Record record
    ) throws URISyntaxException {
        log.debug("REST request to partial update Record partially : {}, {}", id, record);
        if (record.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, record.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!recordRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Record> result = recordRepository
            .findById(record.getId())
            .map(
                existingRecord -> {
                    if (record.getDate() != null) {
                        existingRecord.setDate(record.getDate());
                    }
                    if (record.getLength() != null) {
                        existingRecord.setLength(record.getLength());
                    }
                    if (record.getThrowAway() != null) {
                        existingRecord.setThrowAway(record.getThrowAway());
                    }
                    if (record.getThreat() != null) {
                        existingRecord.setThreat(record.getThreat());
                    }

                    return existingRecord;
                }
            )
            .map(recordRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, record.getId().toString())
        );
    }

    /**
     * {@code GET  /records} : get all the records.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of records in body.
     */
    @GetMapping("/records")
    public List<Record> getAllRecords() {
        log.debug("REST request to get all Records");
        return recordRepository.findAll();
    }

    /**
     * {@code GET  /records/:id} : get the "id" record.
     *
     * @param id the id of the record to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the record, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/records/{id}")
    public ResponseEntity<Record> getRecord(@PathVariable Long id) {
        log.debug("REST request to get Record : {}", id);
        Optional<Record> record = recordRepository.findById(id);
        return ResponseUtil.wrapOrNotFound(record);
    }

    /**
     * {@code DELETE  /records/:id} : delete the "id" record.
     *
     * @param id the id of the record to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/records/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable Long id) {
        log.debug("REST request to delete Record : {}", id);
        recordRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
