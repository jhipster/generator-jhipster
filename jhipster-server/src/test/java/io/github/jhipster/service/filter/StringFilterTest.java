package io.github.jhipster.service.filter;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.LinkedList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

public class StringFilterTest {

    private StringFilter filter;

    private String value = "foo";

    @Before
    public void setup() {
        filter = new StringFilter();
    }

    @Test
    public void testConstructor() {
        assertThat(filter.getEquals()).isNull();
        assertThat(filter.getContains()).isNull();
        assertThat(filter.getSpecified()).isNull();
        assertThat(filter.getIn()).isNull();
        assertThat(filter.toString()).isEqualTo("StringFilter []");
    }

    @Test
    public void testSetEquals() {
        Filter<String> chain = filter.setEquals(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getEquals()).isEqualTo(value);
    }

    @Test
    public void testSetContains() {
        Filter<String> chain = filter.setContains(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getContains()).isEqualTo(value);
    }

    @Test
    public void testSetSpecified() {
        Filter<String> chain = filter.setSpecified(true);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getSpecified()).isEqualTo(true);
    }

    @Test
    public void testSetIn() {
        List<String> list = new LinkedList<>();
        Filter<String> chain = filter.setIn(list);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getIn()).isEqualTo(list);
    }

    @Test
    public void testToString() {
        filter.setEquals(value);
        filter.setContains(value);
        filter.setSpecified(true);
        filter.setIn(new LinkedList<>());
        assertThat(filter.toString()).isEqualTo("StringFilter [contains=foo, equals=foo, specified=true]");
    }
}
