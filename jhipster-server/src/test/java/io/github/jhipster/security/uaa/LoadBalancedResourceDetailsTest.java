package io.github.jhipster.security.uaa;

import io.github.jhipster.test.LogbackRecorder;
import io.github.jhipster.test.LogbackRecorder.Event;

import java.net.URI;
import java.util.List;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.invocation.InvocationOnMock;
import org.mockito.stubbing.Answer;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;

import static io.github.jhipster.security.uaa.LoadBalancedResourceDetails.EXCEPTION_MESSAGE;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowable;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;


public class LoadBalancedResourceDetailsTest {

    private static final String ACCESS_TOKEN_URI = "http://access.token.uri/";
    private static final String TOKEN_SERVICE_ID = "tokkie";

    private LoadBalancerClient client;
    private LogbackRecorder recorder;

    @Before
    public void setup() {
        client = spy(LoadBalancerClient.class);
        doReturn(null).when(client).choose(TOKEN_SERVICE_ID);
        doAnswer(new Answer<URI>() {

            @Override
            public URI answer(InvocationOnMock invocation) throws Throwable {
                return invocation.getArgumentAt(1, URI.class);
            }

        }).when(client).reconstructURI(any(), any());

        recorder = LogbackRecorder.forClass(LoadBalancedResourceDetails.class).reset().capture("ALL");
    }

    @After
    public void teardown() {
        recorder.release();
    }

    @Test
    public void testWithoutClient() {
        LoadBalancedResourceDetails details = spy(new LoadBalancedResourceDetails(null));
        details.setAccessTokenUri(ACCESS_TOKEN_URI);
        assertThat(details.getAccessTokenUri()).isEqualTo(ACCESS_TOKEN_URI);
        verify(client, never()).reconstructURI(any(), any());

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();
    }

    @Test
    public void testWithoutClientWithEmptyTokenService() {
        LoadBalancedResourceDetails details = spy(new LoadBalancedResourceDetails(null));
        details.setAccessTokenUri(ACCESS_TOKEN_URI);
        details.setTokenServiceId("");
        assertThat(details.getAccessTokenUri()).isEqualTo(ACCESS_TOKEN_URI);
        assertThat(details.getTokenServiceId()).isEmpty();
        verify(client, never()).reconstructURI(any(), any());

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();
    }

    @Test
    public void testWithoutClientWithTokenService() {
        LoadBalancedResourceDetails details = spy(new LoadBalancedResourceDetails(null));
        details.setAccessTokenUri(ACCESS_TOKEN_URI);
        details.setTokenServiceId(TOKEN_SERVICE_ID);
        assertThat(details.getAccessTokenUri()).isEqualTo(ACCESS_TOKEN_URI);
        assertThat(details.getTokenServiceId()).isEqualTo(TOKEN_SERVICE_ID);
        verify(client, never()).reconstructURI(any(), any());

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();
    }

    @Test
    public void testWithClient() {
        LoadBalancedResourceDetails details = spy(new LoadBalancedResourceDetails(client));
        details.setAccessTokenUri(ACCESS_TOKEN_URI);
        assertThat(details.getAccessTokenUri()).isEqualTo(ACCESS_TOKEN_URI);
        verify(client, never()).reconstructURI(any(), any());

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();
    }

    @Test
    public void testWithClientAndEmptyTokenService() {
        LoadBalancedResourceDetails details = spy(new LoadBalancedResourceDetails(client));
        details.setAccessTokenUri(ACCESS_TOKEN_URI);
        details.setTokenServiceId("");
        assertThat(details.getAccessTokenUri()).isEqualTo(ACCESS_TOKEN_URI);
        assertThat(details.getTokenServiceId()).isEmpty();
        verify(client, never()).reconstructURI(any(), any());

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();
    }

    @Test
    public void testWithClientAndTokenService() {
        LoadBalancedResourceDetails details = spy(new LoadBalancedResourceDetails(client));
        details.setAccessTokenUri(ACCESS_TOKEN_URI);
        details.setTokenServiceId(TOKEN_SERVICE_ID);
        assertThat(details.getAccessTokenUri()).isEqualTo(ACCESS_TOKEN_URI);
        assertThat(details.getTokenServiceId()).isEqualTo(TOKEN_SERVICE_ID);

        ArgumentCaptor<URI> captor = ArgumentCaptor.forClass(URI.class);
        verify(client).reconstructURI(any(), captor.capture());
        assertThat(captor.getValue().toString()).isEqualTo(ACCESS_TOKEN_URI);

        List<Event> events = recorder.play();
        assertThat(events).isEmpty();
    }

    @Test
    public void testInvalidAccessTokenURI() {
        String invalidUri = "%";
        Throwable exception = catchThrowable(() -> new URI(invalidUri));
        LoadBalancedResourceDetails details = spy(new LoadBalancedResourceDetails(client));
        details.setAccessTokenUri(invalidUri);
        details.setTokenServiceId(TOKEN_SERVICE_ID);
        assertThat(details.getAccessTokenUri()).isEqualTo(invalidUri);

        List<Event> events = recorder.play();
        assertThat(events).hasSize(1);
        Event event = events.get(0);
        assertThat(event.getLevel()).isEqualTo("ERROR");
        assertThat(event.getMessage()).isEqualTo(EXCEPTION_MESSAGE);
        assertThat(event.getThrown()).isNull();
    }
}
