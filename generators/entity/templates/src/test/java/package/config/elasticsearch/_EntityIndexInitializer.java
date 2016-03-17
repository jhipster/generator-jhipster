package <%=packageName%>.config.elasticsearch;

import javax.annotation.PostConstruct;

import org.springframework.stereotype.Component;

import <%=packageName%>.domain.<%= entityClass %>;

@Component
public class <%= entityClass %>IndexInitializer extends AbstractIndexInitializer {

    public <%= entityClass %>IndexInitializer() {
        super(<%= entityClass %>.class);
    }

    @PostConstruct
    public void resetIndex() {
        super.resetIndex();
    }
}
