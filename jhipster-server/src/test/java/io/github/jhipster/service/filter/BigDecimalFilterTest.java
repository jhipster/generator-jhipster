package io.github.jhipster.service.filter;

import java.math.BigDecimal;
import java.util.LinkedList;
import java.util.List;

import org.junit.Before;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class BigDecimalFilterTest {

    private BigDecimalFilter filter;

    private BigDecimal value = new BigDecimal(42L);

    @Before
    public void setup() {
        filter = new BigDecimalFilter();
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
        assertThat(filter.toString()).isEqualTo("BigDecimalFilter []");
    }

    @Test
    public void testSetEquals() {
        Filter<BigDecimal> chain = filter.setEquals(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getEquals()).isEqualTo(value);
    }

    @Test
    public void testSetLessThan() {
        Filter<BigDecimal> chain = filter.setLessThan(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getLessThan()).isEqualTo(value);
    }

    @Test
    public void testSetLessOrEqualThan() {
        Filter<BigDecimal> chain = filter.setLessOrEqualThan(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getLessOrEqualThan()).isEqualTo(value);
    }

    @Test
    public void testSetGreaterThan() {
        Filter<BigDecimal> chain = filter.setGreaterThan(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getGreaterThan()).isEqualTo(value);
    }

    @Test
    public void testSetGreaterOrEqualThan() {
        Filter<BigDecimal> chain = filter.setGreaterOrEqualThan(value);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getGreaterOrEqualThan()).isEqualTo(value);
    }

    @Test
    public void testSetSpecified() {
        Filter<BigDecimal> chain = filter.setSpecified(true);
        assertThat(chain).isEqualTo(filter);
        assertThat(filter.getSpecified()).isEqualTo(true);
    }

    @Test
    public void testSetIn() {
        List<BigDecimal> list = new LinkedList<>();
        Filter<BigDecimal> chain = filter.setIn(list);
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
        assertThat(filter.toString()).isEqualTo("BigDecimalFilter "
                + "[greaterThan=" + str + ", greaterOrEqualThan=" + str + ", lessThan=" + str + ", "
                + "lessOrEqualThan=" + str + ", equals=" + str + ", specified=true, in=[]]");
    }
}
