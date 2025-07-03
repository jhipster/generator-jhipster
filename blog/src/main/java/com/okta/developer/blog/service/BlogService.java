package com.okta.developer.blog.service;

import com.okta.developer.blog.domain.Blog;
import com.okta.developer.blog.repository.BlogRepository;
import com.okta.developer.blog.service.dto.BlogDTO;
import com.okta.developer.blog.service.mapper.BlogMapper;
import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.okta.developer.blog.domain.Blog}.
 */
@Service
@Transactional
public class BlogService {

    private static final Logger LOG = LoggerFactory.getLogger(BlogService.class);

    private final BlogRepository blogRepository;

    private final BlogMapper blogMapper;

    public BlogService(BlogRepository blogRepository, BlogMapper blogMapper) {
        this.blogRepository = blogRepository;
        this.blogMapper = blogMapper;
    }

    /**
     * Save a blog.
     *
     * @param blogDTO the entity to save.
     * @return the persisted entity.
     */
    public BlogDTO save(BlogDTO blogDTO) {
        LOG.debug("Request to save Blog : {}", blogDTO);
        Blog blog = blogMapper.toEntity(blogDTO);
        blog = blogRepository.save(blog);
        return blogMapper.toDto(blog);
    }

    /**
     * Update a blog.
     *
     * @param blogDTO the entity to save.
     * @return the persisted entity.
     */
    public BlogDTO update(BlogDTO blogDTO) {
        LOG.debug("Request to update Blog : {}", blogDTO);
        Blog blog = blogMapper.toEntity(blogDTO);
        blog = blogRepository.save(blog);
        return blogMapper.toDto(blog);
    }

    /**
     * Partially update a blog.
     *
     * @param blogDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<BlogDTO> partialUpdate(BlogDTO blogDTO) {
        LOG.debug("Request to partially update Blog : {}", blogDTO);

        return blogRepository
            .findById(blogDTO.getId())
            .map(existingBlog -> {
                blogMapper.partialUpdate(existingBlog, blogDTO);

                return existingBlog;
            })
            .map(blogRepository::save)
            .map(blogMapper::toDto);
    }

    /**
     * Get all the blogs.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<BlogDTO> findAll() {
        LOG.debug("Request to get all Blogs");
        return blogRepository.findAll().stream().map(blogMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one blog by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<BlogDTO> findOne(Long id) {
        LOG.debug("Request to get Blog : {}", id);
        return blogRepository.findById(id).map(blogMapper::toDto);
    }

    /**
     * Delete the blog by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Blog : {}", id);
        blogRepository.deleteById(id);
    }
}
