package com.okta.developer.blog.web.rest;

import static com.okta.developer.blog.domain.PostAsserts.*;
import static com.okta.developer.blog.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.okta.developer.blog.IntegrationTest;
import com.okta.developer.blog.domain.Post;
import com.okta.developer.blog.repository.PostRepository;
import com.okta.developer.blog.service.PostService;
import com.okta.developer.blog.service.dto.PostDTO;
import com.okta.developer.blog.service.mapper.PostMapper;
import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link PostResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class PostResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/posts";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PostRepository postRepository;

    @Mock
    private PostRepository postRepositoryMock;

    @Autowired
    private PostMapper postMapper;

    @Mock
    private PostService postServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPostMockMvc;

    private Post post;

    private Post insertedPost;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Post createEntity() {
        return new Post().title(DEFAULT_TITLE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Post createUpdatedEntity() {
        return new Post().title(UPDATED_TITLE);
    }

    @BeforeEach
    void initTest() {
        post = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedPost != null) {
            postRepository.delete(insertedPost);
            insertedPost = null;
        }
    }

    @Test
    @Transactional
    void createPost() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Post
        PostDTO postDTO = postMapper.toDto(post);
        var returnedPostDTO = om.readValue(
            restPostMockMvc
                .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(postDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PostDTO.class
        );

        // Validate the Post in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedPost = postMapper.toEntity(returnedPostDTO);
        assertPostUpdatableFieldsEquals(returnedPost, getPersistedPost(returnedPost));

        insertedPost = returnedPost;
    }

    @Test
    @Transactional
    void createPostWithExistingId() throws Exception {
        // Create the Post with an existing ID
        post.setId(1L);
        PostDTO postDTO = postMapper.toDto(post);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPostMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(postDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        post.setTitle(null);

        // Create the Post, which fails.
        PostDTO postDTO = postMapper.toDto(post);

        restPostMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(postDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPosts() throws Exception {
        // Initialize the database
        insertedPost = postRepository.saveAndFlush(post);

        // Get all the postList
        restPostMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(post.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllPostsWithEagerRelationshipsIsEnabled() throws Exception {
        when(postServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restPostMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(postServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllPostsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(postServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restPostMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(postRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getPost() throws Exception {
        // Initialize the database
        insertedPost = postRepository.saveAndFlush(post);

        // Get the post
        restPostMockMvc
            .perform(get(ENTITY_API_URL_ID, post.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(post.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE));
    }

    @Test
    @Transactional
    void getNonExistingPost() throws Exception {
        // Get the post
        restPostMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPost() throws Exception {
        // Initialize the database
        insertedPost = postRepository.saveAndFlush(post);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the post
        Post updatedPost = postRepository.findById(post.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPost are not directly saved in db
        em.detach(updatedPost);
        updatedPost.title(UPDATED_TITLE);
        PostDTO postDTO = postMapper.toDto(updatedPost);

        restPostMockMvc
            .perform(put(ENTITY_API_URL_ID, postDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(postDTO)))
            .andExpect(status().isOk());

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPostToMatchAllProperties(updatedPost);
    }

    @Test
    @Transactional
    void putNonExistingPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(longCount.incrementAndGet());

        // Create the Post
        PostDTO postDTO = postMapper.toDto(post);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPostMockMvc
            .perform(put(ENTITY_API_URL_ID, postDTO.getId()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(postDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(longCount.incrementAndGet());

        // Create the Post
        PostDTO postDTO = postMapper.toDto(post);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPostMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(postDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(longCount.incrementAndGet());

        // Create the Post
        PostDTO postDTO = postMapper.toDto(post);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPostMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(postDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePostWithPatch() throws Exception {
        // Initialize the database
        insertedPost = postRepository.saveAndFlush(post);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the post using partial update
        Post partialUpdatedPost = new Post();
        partialUpdatedPost.setId(post.getId());

        partialUpdatedPost.title(UPDATED_TITLE);

        restPostMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPost.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPost))
            )
            .andExpect(status().isOk());

        // Validate the Post in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPostUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedPost, post), getPersistedPost(post));
    }

    @Test
    @Transactional
    void fullUpdatePostWithPatch() throws Exception {
        // Initialize the database
        insertedPost = postRepository.saveAndFlush(post);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the post using partial update
        Post partialUpdatedPost = new Post();
        partialUpdatedPost.setId(post.getId());

        partialUpdatedPost.title(UPDATED_TITLE);

        restPostMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPost.getId())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPost))
            )
            .andExpect(status().isOk());

        // Validate the Post in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPostUpdatableFieldsEquals(partialUpdatedPost, getPersistedPost(partialUpdatedPost));
    }

    @Test
    @Transactional
    void patchNonExistingPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(longCount.incrementAndGet());

        // Create the Post
        PostDTO postDTO = postMapper.toDto(post);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPostMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, postDTO.getId()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(postDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(longCount.incrementAndGet());

        // Create the Post
        PostDTO postDTO = postMapper.toDto(post);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPostMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(postDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        post.setId(longCount.incrementAndGet());

        // Create the Post
        PostDTO postDTO = postMapper.toDto(post);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPostMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(om.writeValueAsBytes(postDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Post in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePost() throws Exception {
        // Initialize the database
        insertedPost = postRepository.saveAndFlush(post);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the post
        restPostMockMvc
            .perform(delete(ENTITY_API_URL_ID, post.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return postRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Post getPersistedPost(Post post) {
        return postRepository.findById(post.getId()).orElseThrow();
    }

    protected void assertPersistedPostToMatchAllProperties(Post expectedPost) {
        assertPostAllPropertiesEquals(expectedPost, getPersistedPost(expectedPost));
    }

    protected void assertPersistedPostToMatchUpdatableProperties(Post expectedPost) {
        assertPostAllUpdatablePropertiesEquals(expectedPost, getPersistedPost(expectedPost));
    }
}
