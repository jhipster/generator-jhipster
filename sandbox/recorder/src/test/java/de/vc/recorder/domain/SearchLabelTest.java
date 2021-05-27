package de.vc.recorder.domain;

import static org.assertj.core.api.Assertions.assertThat;

import de.vc.recorder.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class SearchLabelTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(SearchLabel.class);
        SearchLabel searchLabel1 = new SearchLabel();
        searchLabel1.setId(1L);
        SearchLabel searchLabel2 = new SearchLabel();
        searchLabel2.setId(searchLabel1.getId());
        assertThat(searchLabel1).isEqualTo(searchLabel2);
        searchLabel2.setId(2L);
        assertThat(searchLabel1).isNotEqualTo(searchLabel2);
        searchLabel1.setId(null);
        assertThat(searchLabel1).isNotEqualTo(searchLabel2);
    }
}
