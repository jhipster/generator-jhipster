package io.github.jhipster.service.filter;

import java.util.LinkedList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class IntegerFilterTest {

    private IntegerFilter filter;

    private Integer value = 42;

    @Before
    public void setup() {
        filter = new IntegerFilter();
    }

    @Test
    public void testConstructor() {
        assertThat(filter.getEquals()).isNull();
        assertThat(filter.getGreaterThan()).isNull();
        assertThat(filter.getGreaterOrEqualThan()).isNull();
        assertThat(filter.getLessThan()).isNull();
        assertThat(filter.getLessOrEqualThan()).isNull();
        assertThat(filter.getSpecified()).isNull();
        assertThat(filter.getIn()).isNull();
        assertThat(filter.toString()).isEqualTo("IntegerFilter []");
    }

    @Test
    public void testSetEquals() {
        Filter<Integer> chain = filter.setEquals(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getEquals()).isEqualTo(value);
    }

    @Test
    public void testSetLessThan() {
        Filter<Integer> chain = filter.setLessThan(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getLessThan()).isEqualTo(value);
    }

    @Test
    public void testSetLessOrEqualThan() {
        Filter<Integer> chain = filter.setLessOrEqualThan(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getLessOrEqualThan()).isEqualTo(value);
    }

    @Test
    public void testSetGreaterThan() {
        Filter<Integer> chain = filter.setGreaterThan(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getGreaterThan()).isEqualTo(value);
    }

    @Test
    public void testSetGreaterOrEqualThan() {
        Filter<Integer> chain = filter.setGreaterOrEqualThan(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getGreaterOrEqualThan()).isEqualTo(value);
    }

    @Test
    public void testSetSpecified() {
        Filter<Integer> chain = filter.setSpecified(true);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getSpecified()).isEqualTo(true);
    }

    @Test
    public void testSetIn() {
        List<Integer> list = new LinkedList<>();
        Filter<Integer> chain = filter.setIn(list);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getIn()).isEqualTo(list);
    }

    @Test
    public void testToString() {
        filter.setEquals(value);
        filter.setLessThan(value);
        filter.setLessOrEqualThan(value);
        filter.setGreaterThan(value);
        filter.setGreaterOrEqualThan(value);
        filter.setSpecified(true);
        filter.setIn(new LinkedList<>());
        String str = value.toString();
        assertThat(filter.toString()).isEqualTo("IntegerFilter "
                + "[greaterThan=" + str + ", greaterOrEqualThan=" + str + ", lessThan=" + str + ", "
                + "lessOrEqualThan=" + str + ", equals=" + str + ", specified=true, in=[]]");
    }
}
