/*
 * Copyright 2016-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see http://www.jhipster.tech/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package io.github.jhipster.config.apidoc;

import static com.google.common.collect.Lists.newArrayList;
import static springfox.documentation.schema.ResolvedTypes.modelRefFactory;
import static springfox.documentation.spi.schema.contexts.ModelContext.inputParam;

import java.util.List;

import org.springframework.data.domain.Pageable;

import com.fasterxml.classmate.ResolvedType;
import com.fasterxml.classmate.TypeResolver;
import com.google.common.base.Function;

import springfox.documentation.builders.ParameterBuilder;
import springfox.documentation.schema.ModelReference;
import springfox.documentation.schema.TypeNameExtractor;
import springfox.documentation.service.Parameter;
import springfox.documentation.service.ResolvedMethodParameter;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.schema.contexts.ModelContext;
import springfox.documentation.spi.service.OperationBuilderPlugin;
import springfox.documentation.spi.service.contexts.OperationContext;
import springfox.documentation.spi.service.contexts.ParameterContext;

public class PageableParameterBuilderPlugin implements OperationBuilderPlugin {

    public static final String PAGE_NAME = "page";
    public static final String PAGE_TYPE = "query";
    public static final String PAGE_DESCRIPTION = "Page number of the requested page";

    public static final String SIZE_NAME = "size";
    public static final String SIZE_TYPE = "query";
    public static final String SIZE_DESCRIPTION = "Size of a page";

    public static final String SORT_NAME = "sort";
    public static final String SORT_TYPE = "query";
    public static final String SORT_DESCRIPTION = "Sorting criteria in the format: property(,asc|desc). "
            + "Default sort order is ascending. "
            + "Multiple sort criteria are supported.";

    private final TypeNameExtractor nameExtractor;
    private final TypeResolver resolver;
    private final ResolvedType pageableType;

    public PageableParameterBuilderPlugin(TypeNameExtractor nameExtractor, TypeResolver resolver) {
        this.nameExtractor = nameExtractor;
        this.resolver = resolver;
        this.pageableType = resolver.resolve(Pageable.class);
    }

    @Override
    public boolean supports(DocumentationType delimiter) {
        return DocumentationType.SWAGGER_2.equals(delimiter);
    }

    @Override
    public void apply(OperationContext context) {
        List<ResolvedMethodParameter> methodParameters = context.getParameters();
        List<Parameter> parameters = newArrayList();

        for (ResolvedMethodParameter methodParameter : methodParameters) {
            ResolvedType resolvedType = methodParameter.getParameterType();

            if (pageableType.equals(resolvedType)) {
                ParameterContext parameterContext = new ParameterContext(methodParameter,
                    new ParameterBuilder(),
                    context.getDocumentationContext(),
                    context.getGenericsNamingStrategy(),
                    context);
                Function<ResolvedType, ? extends ModelReference> factory = createModelRefFactory(parameterContext);

                ModelReference intModel = factory.apply(resolver.resolve(Integer.TYPE));
                ModelReference stringModel = factory.apply(resolver.resolve(List.class, String.class));

                parameters.add(new ParameterBuilder()
                    .name(PAGE_NAME)
                    .parameterType(PAGE_TYPE)
                    .modelRef(intModel)
                    .description(PAGE_DESCRIPTION)
                    .build());

                parameters.add(new ParameterBuilder()
                    .name(SIZE_NAME)
                    .parameterType(SIZE_TYPE)
                    .modelRef(intModel)
                    .description(SIZE_DESCRIPTION)
                    .build());

                parameters.add(new ParameterBuilder()
                    .name(SORT_NAME)
                    .parameterType(SORT_TYPE)
                    .modelRef(stringModel)
                    .allowMultiple(true)
                    .description(SORT_DESCRIPTION)
                    .build());

                context.operationBuilder().parameters(parameters);
            }
        }
    }

    Function<ResolvedType, ? extends ModelReference> createModelRefFactory(ParameterContext context) {
        ModelContext modelContext = inputParam(
            context.getGroupName(),
            context.resolvedMethodParameter().getParameterType(),
            context.getDocumentationType(),
            context.getAlternateTypeProvider(),
            context.getGenericNamingStrategy(),
            context.getIgnorableParameterTypes());
        return modelRefFactory(modelContext, nameExtractor);
    }

    TypeResolver getResolver() {
        return resolver;
    }

    TypeNameExtractor getNameExtractor() {
        return nameExtractor;
    }
}
