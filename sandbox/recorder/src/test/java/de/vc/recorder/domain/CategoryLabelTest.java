package de.vc.recorder.domain;

import static org.assertj.core.api.Assertions.assertThat;

import de.vc.recorder.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class CategoryLabelTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CategoryLabel.class);
        CategoryLabel categoryLabel1 = new CategoryLabel();
        categoryLabel1.setId(1L);
        CategoryLabel categoryLabel2 = new CategoryLabel();
        categoryLabel2.setId(categoryLabel1.getId());
        assertThat(categoryLabel1).isEqualTo(categoryLabel2);
        categoryLabel2.setId(2L);
        assertThat(categoryLabel1).isNotEqualTo(categoryLabel2);
        categoryLabel1.setId(null);
        assertThat(categoryLabel1).isNotEqualTo(categoryLabel2);
    }
}
