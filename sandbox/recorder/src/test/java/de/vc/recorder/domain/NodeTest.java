package de.vc.recorder.domain;

import static org.assertj.core.api.Assertions.assertThat;

import de.vc.recorder.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class NodeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Node.class);
        Node node1 = new Node();
        node1.setId(1L);
        Node node2 = new Node();
        node2.setId(node1.getId());
        assertThat(node1).isEqualTo(node2);
        node2.setId(2L);
        assertThat(node1).isNotEqualTo(node2);
        node1.setId(null);
        assertThat(node1).isNotEqualTo(node2);
    }
}
