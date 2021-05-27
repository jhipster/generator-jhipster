package de.vc.recorder.web.rest;

import de.vc.recorder.domain.SearchLabel;
import de.vc.recorder.repository.SearchLabelRepository;
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
 * REST controller for managing {@link de.vc.recorder.domain.SearchLabel}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class SearchLabelResource {

    private final Logger log = LoggerFactory.getLogger(SearchLabelResource.class);

    private static final String ENTITY_NAME = "recorderSearchLabel";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final SearchLabelRepository searchLabelRepository;

    public SearchLabelResource(SearchLabelRepository searchLabelRepository) {
        this.searchLabelRepository = searchLabelRepository;
    }

    /**
     * {@code POST  /search-labels} : Create a new searchLabel.
     *
     * @param searchLabel the searchLabel to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new searchLabel, or with status {@code 400 (Bad Request)} if the searchLabel has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/search-labels")
    public ResponseEntity<SearchLabel> createSearchLabel(@Valid @RequestBody SearchLabel searchLabel) throws URISyntaxException {
        log.debug("REST request to save SearchLabel : {}", searchLabel);
        if (searchLabel.getId() != null) {
            throw new BadRequestAlertException("A new searchLabel cannot already have an ID", ENTITY_NAME, "idexists");
        }
        SearchLabel result = searchLabelRepository.save(searchLabel);
        return ResponseEntity
            .created(new URI("/api/search-labels/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /search-labels/:id} : Updates an existing searchLabel.
     *
     * @param id the id of the searchLabel to save.
     * @param searchLabel the searchLabel to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated searchLabel,
     * or with status {@code 400 (Bad Request)} if the searchLabel is not valid,
     * or with status {@code 500 (Internal Server Error)} if the searchLabel couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/search-labels/{id}")
    public ResponseEntity<SearchLabel> updateSearchLabel(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody SearchLabel searchLabel
    ) throws URISyntaxException {
        log.debug("REST request to update SearchLabel : {}, {}", id, searchLabel);
        if (searchLabel.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, searchLabel.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!searchLabelRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        SearchLabel result = searchLabelRepository.save(searchLabel);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, searchLabel.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /search-labels/:id} : Partial updates given fields of an existing searchLabel, field will ignore if it is null
     *
     * @param id the id of the searchLabel to save.
     * @param searchLabel the searchLabel to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated searchLabel,
     * or with status {@code 400 (Bad Request)} if the searchLabel is not valid,
     * or with status {@code 404 (Not Found)} if the searchLabel is not found,
     * or with status {@code 500 (Internal Server Error)} if the searchLabel couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/search-labels/{id}", consumes = "application/merge-patch+json")
    public ResponseEntity<SearchLabel> partialUpdateSearchLabel(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody SearchLabel searchLabel
    ) throws URISyntaxException {
        log.debug("REST request to partial update SearchLabel partially : {}, {}", id, searchLabel);
        if (searchLabel.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, searchLabel.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!searchLabelRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<SearchLabel> result = searchLabelRepository
            .findById(searchLabel.getId())
            .map(
                existingSearchLabel -> {
                    if (searchLabel.getName() != null) {
                        existingSearchLabel.setName(searchLabel.getName());
                    }
                    if (searchLabel.getDescription() != null) {
                        existingSearchLabel.setDescription(searchLabel.getDescription());
                    }

                    return existingSearchLabel;
                }
            )
            .map(searchLabelRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, searchLabel.getId().toString())
        );
    }

    /**
     * {@code GET  /search-labels} : get all the searchLabels.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of searchLabels in body.
     */
    @GetMapping("/search-labels")
    public List<SearchLabel> getAllSearchLabels(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all SearchLabels");
        return searchLabelRepository.findAllWithEagerRelationships();
    }

    /**
     * {@code GET  /search-labels/:id} : get the "id" searchLabel.
     *
     * @param id the id of the searchLabel to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the searchLabel, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/search-labels/{id}")
    public ResponseEntity<SearchLabel> getSearchLabel(@PathVariable Long id) {
        log.debug("REST request to get SearchLabel : {}", id);
        Optional<SearchLabel> searchLabel = searchLabelRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(searchLabel);
    }

    /**
     * {@code DELETE  /search-labels/:id} : delete the "id" searchLabel.
     *
     * @param id the id of the searchLabel to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/search-labels/{id}")
    public ResponseEntity<Void> deleteSearchLabel(@PathVariable Long id) {
        log.debug("REST request to delete SearchLabel : {}", id);
        searchLabelRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
