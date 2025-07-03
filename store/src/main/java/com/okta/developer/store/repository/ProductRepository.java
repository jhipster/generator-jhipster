package com.okta.developer.store.repository;

import com.okta.developer.store.domain.ProductEntity;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for the ProductEntity entity.
 */
@SuppressWarnings("unused")
@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {}
