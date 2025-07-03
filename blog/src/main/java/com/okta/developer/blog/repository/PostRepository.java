package com.okta.developer.blog.repository;

import com.okta.developer.blog.domain.Post;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the Post entity.
 *
 * When extending this class, extend PostRepositoryWithBagRelationships too.
 * For more information refer to https://github.com/jhipster/generator-jhipster/issues/17990.
 */
@Repository
public interface PostRepository extends PostRepositoryWithBagRelationships, JpaRepository<Post, Long> {
    default Optional<Post> findOneWithEagerRelationships(Long id) {
        return this.fetchBagRelationships(this.findOneWithToOneRelationships(id));
    }

    default List<Post> findAllWithEagerRelationships() {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships());
    }

    default Page<Post> findAllWithEagerRelationships(Pageable pageable) {
        return this.fetchBagRelationships(this.findAllWithToOneRelationships(pageable));
    }

    @Query(value = "select post from Post post left join fetch post.blog", countQuery = "select count(post) from Post post")
    Page<Post> findAllWithToOneRelationships(Pageable pageable);

    @Query("select post from Post post left join fetch post.blog")
    List<Post> findAllWithToOneRelationships();

    @Query("select post from Post post left join fetch post.blog where post.id =:id")
    Optional<Post> findOneWithToOneRelationships(@Param("id") Long id);
}
