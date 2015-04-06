package com.mycompany.myapp.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.mycompany.myapp.domain.MyEntity;
import com.mycompany.myapp.repository.MyEntityRepository;
import com.mycompany.myapp.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

/**
 * REST controller for managing MyEntity.
 */
@RestController
@RequestMapping("/api")
public class MyEntityResource {

    private final Logger log = LoggerFactory.getLogger(MyEntityResource.class);

    @Inject
    private MyEntityRepository myEntityRepository;

    /**
     * POST  /myEntitys -> Create a new myEntity.
     */
    @RequestMapping(value = "/myEntitys",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> create(@Valid @RequestBody MyEntity myEntity) throws URISyntaxException {
        log.debug("REST request to save MyEntity : {}", myEntity);
        if (myEntity.getId() != null) {
            return ResponseEntity.badRequest().header("Failure", "A new myEntity cannot already have an ID").build();
        }
        myEntityRepository.save(myEntity);
        return ResponseEntity.created(new URI("/api/myEntitys/" + myEntity.getId())).build();
    }

    /**
     * PUT  /myEntitys -> Updates an existing myEntity.
     */
    @RequestMapping(value = "/myEntitys",
        method = RequestMethod.PUT,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<Void> update(@Valid @RequestBody MyEntity myEntity) throws URISyntaxException {
        log.debug("REST request to update MyEntity : {}", myEntity);
        if (myEntity.getId() == null) {
            return create(myEntity);
        }
        myEntityRepository.save(myEntity);
        return ResponseEntity.ok().build();
    }

    /**
     * GET  /myEntitys -> get all the myEntitys.
     */
    @RequestMapping(value = "/myEntitys",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<List<MyEntity>> getAll(@RequestParam(value = "page" , required = false) Integer offset,
                                  @RequestParam(value = "per_page", required = false) Integer limit)
        throws URISyntaxException {
        Page<MyEntity> page = myEntityRepository.findAll(PaginationUtil.generatePageRequest(offset, limit));
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/myEntitys", offset, limit);
        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * GET  /myEntitys/:id -> get the "id" myEntity.
     */
    @RequestMapping(value = "/myEntitys/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public ResponseEntity<MyEntity> get(@PathVariable Long id) {
        log.debug("REST request to get MyEntity : {}", id);
        return Optional.ofNullable(myEntityRepository.findOne(id))
            .map(myEntity -> new ResponseEntity<>(
                myEntity,
                HttpStatus.OK))
            .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * DELETE  /myEntitys/:id -> delete the "id" myEntity.
     */
    @RequestMapping(value = "/myEntitys/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public void delete(@PathVariable Long id) {
        log.debug("REST request to delete MyEntity : {}", id);
        myEntityRepository.delete(id);
    }
}
