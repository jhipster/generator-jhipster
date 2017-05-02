<%#
 Copyright 2013-2017 the original author or authors.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.service.mapper;

import java.util.List;

/**
 * Contract for a generic dto to entity mapper.
 @param <DTO> - DTO type parameter.
 @param <ENTITY> - Entity type parameter.
 */

public interface EntityMapper <DTO, ENTITY> {

    public ENTITY toEntity(DTO dto);

    public DTO toDto(ENTITY entity);

    public List <ENTITY> toEntity(List<DTO> dtoList);

    public List <DTO> toDto(List<ENTITY> entityList);
}
