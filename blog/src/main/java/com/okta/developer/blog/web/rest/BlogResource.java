package com.okta.developer.blog.web.rest;

import com.okta.developer.blog.repository.BlogRepository;
import com.okta.developer.blog.service.BlogService;
import com.okta.developer.blog.service.dto.BlogDTO;
import com.okta.developer.blog.web.rest.errors.BadRequestAlertException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.okta.developer.blog.domain.Blog}.
 */
@RestController
@RequestMapping("/api/blogs")
public class BlogResource {

    private static final Logger LOG = LoggerFactory.getLogger(BlogResource.class);

    private static final String ENTITY_NAME = "blogBlog";

    @Value("${jhipster.clientApp.name:blog}")
    private String applicationName;

    private final BlogService blogService;

    private final BlogRepository blogRepository;

    public BlogResource(BlogService blogService, BlogRepository blogRepository) {
        this.blogService = blogService;
        this.blogRepository = blogRepository;
    }

    /**
     * {@code POST  /blogs} : Create a new blog.
     *
     * @param blogDTO the blogDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new blogDTO, or with status {@code 400 (Bad Request)} if the blog has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<BlogDTO> createBlog(@Valid @RequestBody BlogDTO blogDTO) throws URISyntaxException {
        LOG.debug("REST request to save Blog : {}", blogDTO);
        if (blogDTO.getId() != null) {
            throw new BadRequestAlertException("A new blog cannot already have an ID", ENTITY_NAME, "idexists");
        }
        blogDTO = blogService.save(blogDTO);
        return ResponseEntity.created(new URI("/api/blogs/" + blogDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, true, ENTITY_NAME, blogDTO.getId().toString()))
            .body(blogDTO);
    }

    /**
     * {@code PUT  /blogs/:id} : Updates an existing blog.
     *
     * @param id the id of the blogDTO to save.
     * @param blogDTO the blogDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated blogDTO,
     * or with status {@code 400 (Bad Request)} if the blogDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the blogDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<BlogDTO> updateBlog(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody BlogDTO blogDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Blog : {}, {}", id, blogDTO);
        if (blogDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, blogDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!blogRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        blogDTO = blogService.update(blogDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, blogDTO.getId().toString()))
            .body(blogDTO);
    }

    /**
     * {@code PATCH  /blogs/:id} : Partial updates given fields of an existing blog, field will ignore if it is null
     *
     * @param id the id of the blogDTO to save.
     * @param blogDTO the blogDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated blogDTO,
     * or with status {@code 400 (Bad Request)} if the blogDTO is not valid,
     * or with status {@code 404 (Not Found)} if the blogDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the blogDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<BlogDTO> partialUpdateBlog(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody BlogDTO blogDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Blog partially : {}, {}", id, blogDTO);
        if (blogDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, blogDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!blogRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<BlogDTO> result = blogService.partialUpdate(blogDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, true, ENTITY_NAME, blogDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /blogs} : get all the blogs.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of blogs in body.
     */
    @GetMapping("")
    public List<BlogDTO> getAllBlogs() {
        LOG.debug("REST request to get all Blogs");
        return blogService.findAll();
    }

    /**
     * {@code GET  /blogs/:id} : get the "id" blog.
     *
     * @param id the id of the blogDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the blogDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BlogDTO> getBlog(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Blog : {}", id);
        Optional<BlogDTO> blogDTO = blogService.findOne(id);
        return ResponseUtil.wrapOrNotFound(blogDTO);
    }

    /**
     * {@code DELETE  /blogs/:id} : delete the "id" blog.
     *
     * @param id the id of the blogDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Blog : {}", id);
        blogService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, true, ENTITY_NAME, id.toString()))
            .build();
    }
}
