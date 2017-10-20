package io.github.jhipster.web.util;

import java.util.Optional;

import org.junit.Before;
import org.junit.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

public class ResponseUtilTest {

    private static final String HEADER_NAME = "X-Test";
    private static final String HEADER_VALUE = "FooBar";

    private Optional<Integer> yes;
    private Optional<Integer> no;
    private HttpHeaders headers;

    @Before
    public void setup() {
        yes = Optional.of(42);
        no = Optional.empty();
        headers = new HttpHeaders();
        headers.add(HEADER_NAME, HEADER_VALUE);
    }

    @Test
    public void testYesWithoutHeaders() {
        ResponseEntity<Integer> response = ResponseUtil.wrapOrNotFound(yes);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(42);
        assertThat(response.getHeaders()).isEmpty();
    }

    @Test
    public void testNoWithoutHeaders() {
        ResponseEntity<Integer> response = ResponseUtil.wrapOrNotFound(no);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
        assertThat(response.getHeaders()).isEmpty();
    }

    @Test
    public void testYesWithHeaders() {
        ResponseEntity<Integer> response = ResponseUtil.wrapOrNotFound(yes, headers);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(42);
        assertThat(response.getHeaders()).hasSize(1);
        assertThat(response.getHeaders().get(HEADER_NAME)).hasSize(1);
        assertThat(response.getHeaders().get(HEADER_NAME).get(0)).isEqualTo(HEADER_VALUE);
    }

    @Test
    public void testNoWithHeaders() {
        ResponseEntity<Integer> response = ResponseUtil.wrapOrNotFound(no, headers);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNull();
        assertThat(response.getHeaders()).isEmpty();
    }
}
