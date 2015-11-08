package <%=packageName%>.config;

import org.apache.solr.client.solrj.SolrServer;
import org.apache.solr.client.solrj.impl.HttpSolrServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfigureAfter;
import org.springframework.boot.bind.RelaxedPropertyResolver;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.solr.core.SolrTemplate;

@Configuration
@AutoConfigureAfter(value = {JacksonConfiguration.class})
public class SolrConfiguration implements EnvironmentAware {


    private final Logger log = LoggerFactory.getLogger(SolrConfiguration.class);

    private RelaxedPropertyResolver propertyResolver;

    @Override
    public void setEnvironment(Environment environment) {
        this.propertyResolver = new RelaxedPropertyResolver(environment, ENV_SOLR);
    }

    private static final String ENV_SOLR = "spring.data.solr.";
    private static final String SOLR_HOST = "host";


    @Bean
    public SolrServer solrServer() {
        String solrHost = this.propertyResolver.getRequiredProperty(SOLR_HOST);
        log.debug("Configuring SOLR base url: " + solrHost);
        return new HttpSolrServer(solrHost);
    }

    @Bean
    public SolrTemplate solrTemplate(SolrServer server) throws Exception {
        return new SolrTemplate(server);
    }

}
