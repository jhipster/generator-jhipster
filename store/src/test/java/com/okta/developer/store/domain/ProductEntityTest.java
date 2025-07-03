package com.okta.developer.store.domain;

import static com.okta.developer.store.domain.ProductEntityTestSamples.*;
import static org.assertj.core.api.Assertions.assertThat;

import com.okta.developer.store.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class ProductEntityTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ProductEntity.class);
        ProductEntity productEntity1 = getProductEntitySample1();
        ProductEntity productEntity2 = new ProductEntity();
        assertThat(productEntity1).isNotEqualTo(productEntity2);

        productEntity2.setId(productEntity1.getId());
        assertThat(productEntity1).isEqualTo(productEntity2);

        productEntity2 = getProductEntitySample2();
        assertThat(productEntity1).isNotEqualTo(productEntity2);
    }
}
