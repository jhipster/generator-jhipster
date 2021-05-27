package de.vc.recorder.domain;

import static org.assertj.core.api.Assertions.assertThat;

import de.vc.recorder.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class MachineLabelTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(MachineLabel.class);
        MachineLabel machineLabel1 = new MachineLabel();
        machineLabel1.setId(1L);
        MachineLabel machineLabel2 = new MachineLabel();
        machineLabel2.setId(machineLabel1.getId());
        assertThat(machineLabel1).isEqualTo(machineLabel2);
        machineLabel2.setId(2L);
        assertThat(machineLabel1).isNotEqualTo(machineLabel2);
        machineLabel1.setId(null);
        assertThat(machineLabel1).isNotEqualTo(machineLabel2);
    }
}
