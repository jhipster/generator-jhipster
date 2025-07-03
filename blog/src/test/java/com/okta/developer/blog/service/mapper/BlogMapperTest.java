package com.okta.developer.blog.service.mapper;

import static com.okta.developer.blog.domain.BlogAsserts.*;
import static com.okta.developer.blog.domain.BlogTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class BlogMapperTest {

    private BlogMapper blogMapper;

    @BeforeEach
    void setUp() {
        blogMapper = new BlogMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getBlogSample1();
        var actual = blogMapper.toEntity(blogMapper.toDto(expected));
        assertBlogAllPropertiesEquals(expected, actual);
    }
}
