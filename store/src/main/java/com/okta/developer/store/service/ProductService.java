package com.okta.developer.store.service;

import com.okta.developer.store.domain.ProductEntity;
import com.okta.developer.store.repository.ProductRepository;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link com.okta.developer.store.domain.ProductEntity}.
 */
@Service
@Transactional
public class ProductService {

    private static final Logger LOG = LoggerFactory.getLogger(ProductService.class);

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Save a product.
     *
     * @param productEntity the entity to save.
     * @return the persisted entity.
     */
    public ProductEntity save(ProductEntity productEntity) {
        LOG.debug("Request to save Product : {}", productEntity);
        return productRepository.save(productEntity);
    }

    /**
     * Update a product.
     *
     * @param productEntity the entity to save.
     * @return the persisted entity.
     */
    public ProductEntity update(ProductEntity productEntity) {
        LOG.debug("Request to update Product : {}", productEntity);
        return productRepository.save(productEntity);
    }

    /**
     * Partially update a product.
     *
     * @param productEntity the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ProductEntity> partialUpdate(ProductEntity productEntity) {
        LOG.debug("Request to partially update Product : {}", productEntity);

        return productRepository
            .findById(productEntity.getId())
            .map(existingProduct -> {
                if (productEntity.getTitle() != null) {
                    existingProduct.setTitle(productEntity.getTitle());
                }
                if (productEntity.getPrice() != null) {
                    existingProduct.setPrice(productEntity.getPrice());
                }
                if (productEntity.getImage() != null) {
                    existingProduct.setImage(productEntity.getImage());
                }
                if (productEntity.getImageContentType() != null) {
                    existingProduct.setImageContentType(productEntity.getImageContentType());
                }

                return existingProduct;
            })
            .map(productRepository::save);
    }

    /**
     * Get all the products.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ProductEntity> findAll(Pageable pageable) {
        LOG.debug("Request to get all Products");
        return productRepository.findAll(pageable);
    }

    /**
     * Get one product by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ProductEntity> findOne(Long id) {
        LOG.debug("Request to get Product : {}", id);
        return productRepository.findById(id);
    }

    /**
     * Delete the product by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Product : {}", id);
        productRepository.deleteById(id);
    }
}
