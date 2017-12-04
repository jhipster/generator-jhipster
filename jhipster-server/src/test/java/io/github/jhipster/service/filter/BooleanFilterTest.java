package io.github.jhipster.service.filter;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.LinkedList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

public class BooleanFilterTest {

    private BooleanFilter filter;

    private Boolean value = true;

    @Before
    public void setup() {
        filter = new BooleanFilter();
    }

    @Test
    public void testConstructor() {
        assertThat(filter.getEquals()).isNull();
        assertThat(filter.getSpecified()).isNull();
        assertThat(filter.getIn()).isNull();
        assertThat(filter.toString()).isEqualTo("BooleanFilter []");
    }

    @Test
    public void testSetEquals() {
        Filter<Boolean> chain = filter.setEquals(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getEquals()).isEqualTo(value);
    }

    @Test
    public void testSetSpecified() {
        Filter<Boolean> chain = filter.setSpecified(true);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getSpecified()).isEqualTo(true);
    }

    @Test
    public void testSetIn() {
        List<Boolean> list = new LinkedList<>();
        Filter<Boolean> chain = filter.setIn(list);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getIn()).isEqualTo(list);
    }

    @Test
    public void testtoString() {
        filter.setEquals(value);
        filter.setSpecified(true);
        filter.setIn(new LinkedList<>());
        assertThat(filter.toString()).isEqualTo("BooleanFilter [equals=true, in=[], specified=true]");
    }
}
