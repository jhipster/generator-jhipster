package de.vc.recorder.domain;

import static org.assertj.core.api.Assertions.assertThat;

import de.vc.recorder.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class RecordTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Record.class);
        Record record1 = new Record();
        record1.setId(1L);
        Record record2 = new Record();
        record2.setId(record1.getId());
        assertThat(record1).isEqualTo(record2);
        record2.setId(2L);
        assertThat(record1).isNotEqualTo(record2);
        record1.setId(null);
        assertThat(record1).isNotEqualTo(record2);
    }
}
