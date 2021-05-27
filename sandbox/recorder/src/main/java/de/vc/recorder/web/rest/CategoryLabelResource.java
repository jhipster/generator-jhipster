package de.vc.recorder.web.rest;

import de.vc.recorder.domain.CategoryLabel;
import de.vc.recorder.repository.CategoryLabelRepository;
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
 * REST controller for managing {@link de.vc.recorder.domain.CategoryLabel}.
 */
@RestController
@RequestMapping("/api")
@Transactional
public class CategoryLabelResource {

    private final Logger log = LoggerFactory.getLogger(CategoryLabelResource.class);

    private static final String ENTITY_NAME = "recorderCategoryLabel";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final CategoryLabelRepository categoryLabelRepository;

    public CategoryLabelResource(CategoryLabelRepository categoryLabelRepository) {
        this.categoryLabelRepository = categoryLabelRepository;
    }

    /**
     * {@code POST  /category-labels} : Create a new categoryLabel.
     *
     * @param categoryLabel the categoryLabel to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new categoryLabel, or with status {@code 400 (Bad Request)} if the categoryLabel has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/category-labels")
    public ResponseEntity<CategoryLabel> createCategoryLabel(@Valid @RequestBody CategoryLabel categoryLabel) throws URISyntaxException {
        log.debug("REST request to save CategoryLabel : {}", categoryLabel);
        if (categoryLabel.getId() != null) {
            throw new BadRequestAlertException("A new categoryLabel cannot already have an ID", ENTITY_NAME, "idexists");
        }
        CategoryLabel result = categoryLabelRepository.save(categoryLabel);
        return ResponseEntity
            .created(new URI("/api/category-labels/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /category-labels/:id} : Updates an existing categoryLabel.
     *
     * @param id the id of the categoryLabel to save.
     * @param categoryLabel the categoryLabel to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated categoryLabel,
     * or with status {@code 400 (Bad Request)} if the categoryLabel is not valid,
     * or with status {@code 500 (Internal Server Error)} if the categoryLabel couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/category-labels/{id}")
    public ResponseEntity<CategoryLabel> updateCategoryLabel(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CategoryLabel categoryLabel
    ) throws URISyntaxException {
        log.debug("REST request to update CategoryLabel : {}, {}", id, categoryLabel);
        if (categoryLabel.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, categoryLabel.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!categoryLabelRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        CategoryLabel result = categoryLabelRepository.save(categoryLabel);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, categoryLabel.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /category-labels/:id} : Partial updates given fields of an existing categoryLabel, field will ignore if it is null
     *
     * @param id the id of the categoryLabel to save.
     * @param categoryLabel the categoryLabel to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated categoryLabel,
     * or with status {@code 400 (Bad Request)} if the categoryLabel is not valid,
     * or with status {@code 404 (Not Found)} if the categoryLabel is not found,
     * or with status {@code 500 (Internal Server Error)} if the categoryLabel couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/category-labels/{id}", consumes = "application/merge-patch+json")
    public ResponseEntity<CategoryLabel> partialUpdateCategoryLabel(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CategoryLabel categoryLabel
    ) throws URISyntaxException {
        log.debug("REST request to partial update CategoryLabel partially : {}, {}", id, categoryLabel);
        if (categoryLabel.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, categoryLabel.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!categoryLabelRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CategoryLabel> result = categoryLabelRepository
            .findById(categoryLabel.getId())
            .map(
                existingCategoryLabel -> {
                    if (categoryLabel.getName() != null) {
                        existingCategoryLabel.setName(categoryLabel.getName());
                    }
                    if (categoryLabel.getDescription() != null) {
                        existingCategoryLabel.setDescription(categoryLabel.getDescription());
                    }
                    if (categoryLabel.getAuthorityAttach() != null) {
                        existingCategoryLabel.setAuthorityAttach(categoryLabel.getAuthorityAttach());
                    }

                    return existingCategoryLabel;
                }
            )
            .map(categoryLabelRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, categoryLabel.getId().toString())
        );
    }

    /**
     * {@code GET  /category-labels} : get all the categoryLabels.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of categoryLabels in body.
     */
    @GetMapping("/category-labels")
    public List<CategoryLabel> getAllCategoryLabels(@RequestParam(required = false, defaultValue = "false") boolean eagerload) {
        log.debug("REST request to get all CategoryLabels");
        return categoryLabelRepository.findAllWithEagerRelationships();
    }

    /**
     * {@code GET  /category-labels/:id} : get the "id" categoryLabel.
     *
     * @param id the id of the categoryLabel to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the categoryLabel, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/category-labels/{id}")
    public ResponseEntity<CategoryLabel> getCategoryLabel(@PathVariable Long id) {
        log.debug("REST request to get CategoryLabel : {}", id);
        Optional<CategoryLabel> categoryLabel = categoryLabelRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(categoryLabel);
    }

    /**
     * {@code DELETE  /category-labels/:id} : delete the "id" categoryLabel.
     *
     * @param id the id of the categoryLabel to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/category-labels/{id}")
    public ResponseEntity<Void> deleteCategoryLabel(@PathVariable Long id) {
        log.debug("REST request to delete CategoryLabel : {}", id);
        categoryLabelRepository.deleteById(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
