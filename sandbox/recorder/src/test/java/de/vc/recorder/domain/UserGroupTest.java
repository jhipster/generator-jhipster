package de.vc.recorder.domain;

import static org.assertj.core.api.Assertions.assertThat;

import de.vc.recorder.web.rest.TestUtil;
import org.junit.jupiter.api.Test;

class UserGroupTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(UserGroup.class);
        UserGroup userGroup1 = new UserGroup();
        userGroup1.setId(1L);
        UserGroup userGroup2 = new UserGroup();
        userGroup2.setId(userGroup1.getId());
        assertThat(userGroup1).isEqualTo(userGroup2);
        userGroup2.setId(2L);
        assertThat(userGroup1).isNotEqualTo(userGroup2);
        userGroup1.setId(null);
        assertThat(userGroup1).isNotEqualTo(userGroup2);
    }
}
