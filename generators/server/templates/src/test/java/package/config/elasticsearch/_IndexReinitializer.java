<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

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
package <%=packageName%>.config.elasticsearch;

import static java.lang.System.currentTimeMillis;

import javax.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.stereotype.Component;

@Component
public class IndexReinitializer {

    private Logger logger = LoggerFactory.getLogger(getClass());

    @Autowired
    private ElasticsearchTemplate elasticsearchTemplate;

    @PostConstruct
    public void resetIndex() {
        long t = currentTimeMillis();
        elasticsearchTemplate.deleteIndex("_all");
        t = currentTimeMillis() - t;
        logger.debug("Elasticsearch indexes reset in {} ms", t);
    }
}
