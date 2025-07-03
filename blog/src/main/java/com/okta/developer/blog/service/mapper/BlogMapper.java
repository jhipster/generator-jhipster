package com.okta.developer.blog.service.mapper;

import com.okta.developer.blog.domain.Blog;
import com.okta.developer.blog.service.dto.BlogDTO;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link Blog} and its DTO {@link BlogDTO}.
 */
@Mapper(componentModel = "spring")
public interface BlogMapper extends EntityMapper<BlogDTO, Blog> {}
