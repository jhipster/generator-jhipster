package tech.jhipster.sample.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.cloud.stream.binder.test.InputDestination;
import org.springframework.cloud.stream.binder.test.OutputDestination;
// import org.springframework.cloud.stream.test.binder.MessageCollector;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.util.MimeTypeUtils;
import tech.jhipster.sample.IntegrationTest;
import tech.jhipster.sample.config.EmbeddedKafka;
import tech.jhipster.sample.config.KafkaSseConsumer;
import tech.jhipster.sample.config.KafkaSseProducer;

@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
@EmbeddedKafka
class SampleMongoKafkaKafkaResourceIT {

    // @Autowired
    // private MessageCollector collector;

    @Autowired
    private MockMvc restMockMvc;

    // @Autowired
    // @Qualifier(KafkaSseProducer.CHANNELNAME)
    // private MessageChannel output;

    // @Autowired
    // @Qualifier(KafkaSseConsumer.CHANNELNAME)
    // private MessageChannel input;

    @Autowired
    private InputDestination input;

    @Autowired
    private OutputDestination output;

    @Test
    void producesMessages() throws Exception {
        restMockMvc.perform(post("/api/sample-mongo-kafka-kafka/publish?message=value-produce")).andExpect(status().isOk());
        // BlockingQueue<Message<?>> messages = collector.forChannel(output);
        // GenericMessage<String> payload = (GenericMessage<String>) messages.take();
        assertThat(output.receive().getPayload()).isEqualTo("value-produce");
    }

    @Test
    void consumesMessages() throws Exception {
        Map<String, Object> map = new HashMap<>();
        map.put(MessageHeaders.CONTENT_TYPE, MimeTypeUtils.TEXT_PLAIN_VALUE);
        MessageHeaders headers = new MessageHeaders(map);
        Message<String> testMessage = new GenericMessage<>("value-consume", headers);
        MvcResult mvcResult = restMockMvc
            .perform(get("/api/sample-mongo-kafka-kafka/register"))
            .andExpect(status().isOk())
            .andExpect(request().asyncStarted())
            .andReturn();
        for (int i = 0; i < 100; i++) {
            input.send(testMessage);
            Thread.sleep(100);
            String content = mvcResult.getResponse().getContentAsString();
            if (content.contains("data:value-consume")) {
                restMockMvc.perform(get("/api/sample-mongo-kafka-kafka/unregister"));
                return;
            }
        }
        fail("Expected content data:value-consume not received");
    }
}
