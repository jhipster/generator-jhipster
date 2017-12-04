package io.github.jhipster.domain.util;

import io.github.jhipster.test.LogbackRecorder;

import java.sql.Types;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.hibernate.dialect.Dialect;
import org.hibernate.type.descriptor.sql.BinaryTypeDescriptor;
import org.hibernate.type.descriptor.sql.BlobTypeDescriptor;
import org.hibernate.type.descriptor.sql.BooleanTypeDescriptor;
import org.hibernate.type.descriptor.sql.SqlTypeDescriptor;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class FixedPostgreSQL82DialectTest {

    private final List<LogbackRecorder> recorders = new LinkedList<>();

    private final Map<Integer, String> registered = new LinkedHashMap<>();

    private FixedPostgreSQL82Dialect dialect;

    @Before
    public void setup() {
        recorders.add(LogbackRecorder.forName("org.jboss.logging").reset().capture("ALL"));
        recorders.add(LogbackRecorder.forClass(Dialect.class).reset().capture("ALL"));

        dialect = new FixedPostgreSQL82Dialect() {

            @Override
            protected void registerColumnType(int code, String name) {
                registered.put(code, name);
                super.registerColumnType(code, name);
            }

        };
    }

    @After
    public void teardown() {
        recorders.forEach(LogbackRecorder::release);
        recorders.clear();
        registered.clear();
    }

    @Test
    public void testBlobTypeRegister() {
        assertThat(registered.get(Types.BLOB)).isEqualTo("bytea");
    }

    @Test
    public void testBlobTypeRemap() {
        SqlTypeDescriptor descriptor = dialect.remapSqlTypeDescriptor(BlobTypeDescriptor.DEFAULT);
        assertThat(descriptor).isEqualTo(BinaryTypeDescriptor.INSTANCE);
    }

    @Test
    public void testOtherTypeRemap() {
        SqlTypeDescriptor descriptor = dialect.remapSqlTypeDescriptor(BooleanTypeDescriptor.INSTANCE);
        assertThat(descriptor).isEqualTo(BooleanTypeDescriptor.INSTANCE);
    }
}
