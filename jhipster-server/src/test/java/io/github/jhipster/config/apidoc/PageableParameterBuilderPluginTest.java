package io.github.jhipster.config.apidoc;

import java.lang.reflect.Method;
import java.util.LinkedList;
import java.util.List;

import com.fasterxml.classmate.TypeResolver;

import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Pageable;
import org.springframework.plugin.core.SimplePluginRegistry;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.method.HandlerMethod;

import springfox.documentation.RequestHandler;
import springfox.documentation.builders.OperationBuilder;
import springfox.documentation.schema.TypeNameExtractor;
import springfox.documentation.service.Parameter;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.schema.TypeNameProviderPlugin;
import springfox.documentation.spi.service.contexts.DocumentationContext;
import springfox.documentation.spi.service.contexts.OperationContext;
import springfox.documentation.spi.service.contexts.RequestMappingContext;
import springfox.documentation.spring.web.WebMvcRequestHandler;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

/**
 * Unit tests for io.github.jhipster.config.apidoc.PageableParameterBuilderPlugin.
 *
 * @see PageableParameterBuilderPlugin
 */
public class PageableParameterBuilderPluginTest {

    private OperationBuilder builder;
    private OperationContext context;
    private TypeResolver resolver;
    private TypeNameExtractor extractor;
    private PageableParameterBuilderPlugin plugin;

    @Captor
    private ArgumentCaptor<List<Parameter>> captor;

    @Before
    public void setup() throws Exception {
        MockitoAnnotations.initMocks(this);

        Method method = this.getClass().getMethod("test", new Class<?>[]{ Pageable.class, Integer.class });
        RequestHandler handler = new WebMvcRequestHandler(null, new HandlerMethod(this, method));
        DocumentationContext docContext = mock(DocumentationContext.class);
        RequestMappingContext reqContext = new RequestMappingContext(docContext, handler);
        builder = spy(new OperationBuilder(null));
        context = new OperationContext(builder, RequestMethod.GET, reqContext, 0);

        resolver = new TypeResolver();
        List<TypeNameProviderPlugin> plugins = new LinkedList<>();
        extractor = new TypeNameExtractor(resolver, SimplePluginRegistry.create(plugins));
        plugin = new PageableParameterBuilderPlugin(extractor, resolver);
    }

    @Test
    public void testConstructor() {
        assertThat(plugin.getResolver()).isEqualTo(resolver);
        assertThat(plugin.getNameExtractor()).isEqualTo(extractor);
    }

    @Test
    public void testSupports() {
        boolean test1 = plugin.supports(DocumentationType.SWAGGER_12);
        assertThat(test1).isEqualTo(false);
        boolean test2 = plugin.supports(DocumentationType.SWAGGER_2);
        assertThat(test2).isEqualTo(true);
    }

    @Test
    public void testApply() {
        plugin.apply(context);
        verify(builder).parameters(captor.capture());

        List<Parameter> parameters = captor.getValue();
        assertThat(parameters).hasSize(3);

        Parameter parameter0 = parameters.get(0);
        assertThat(parameter0.getParamType()).isEqualTo(PageableParameterBuilderPlugin.PAGE_TYPE);
        assertThat(parameter0.getName()).isEqualTo(PageableParameterBuilderPlugin.PAGE_NAME);
        assertThat(parameter0.getDescription()).isEqualTo(PageableParameterBuilderPlugin.PAGE_DESCRIPTION);
        assertThat(parameter0.getModelRef().getType()).isEqualTo("int");
        assertThat(parameter0.isAllowMultiple()).isEqualTo(false);

        Parameter parameter1 = parameters.get(1);
        assertThat(parameter1.getParamType()).isEqualTo(PageableParameterBuilderPlugin.SIZE_TYPE);
        assertThat(parameter1.getName()).isEqualTo(PageableParameterBuilderPlugin.SIZE_NAME);
        assertThat(parameter1.getDescription()).isEqualTo(PageableParameterBuilderPlugin.SIZE_DESCRIPTION);
        assertThat(parameter1.getModelRef().getType()).isEqualTo("int");
        assertThat(parameter1.isAllowMultiple()).isEqualTo(false);

        Parameter parameter2 = parameters.get(2);
        assertThat(parameter2.getParamType()).isEqualTo(PageableParameterBuilderPlugin.SORT_TYPE);
        assertThat(parameter2.getName()).isEqualTo(PageableParameterBuilderPlugin.SORT_NAME);
        assertThat(parameter2.getDescription()).isEqualTo(PageableParameterBuilderPlugin.SORT_DESCRIPTION);
        assertThat(parameter2.getModelRef().getType()).isEqualTo("List");
        assertThat(parameter2.getModelRef().getItemType()).isEqualTo("string");
        assertThat(parameter2.isAllowMultiple()).isEqualTo(true);
    }

    public void test(Pageable yes, Integer no) {
        // noop
    }
}
