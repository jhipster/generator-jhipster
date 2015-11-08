package <%=packageName%>.web.rest;

import <%=packageName%>.Application;
import <%=packageName%>.config.audit.AuditEventConverter;
import <%=packageName%>.domain.PersistentAuditEvent;
import <%=packageName%>.repository.PersistenceAuditEventRepository;
import <%=packageName%>.service.AuditEventService;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;<% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.inject.Inject;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the AuditResource REST controller.
 *
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest<% if (databaseType == 'sql') { %>
@Transactional<% } %>
public class AuditResourceIntTest {

    private static final String SAMPLE_PRINCIPAL = "SAMPLE_PRINCIPAL";
    private static final String SAMPLE_TYPE = "SAMPLE_TYPE";
    private static final LocalDateTime SAMPLE_TIMESTAMP = LocalDateTime.parse("2015-08-04T10:11:30");

    @Inject
    private PersistenceAuditEventRepository auditEventRepository;

    @Inject
    private AuditEventConverter auditEventConverter;

    private PersistentAuditEvent auditEvent;

    private MockMvc restAuditMockMvc;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        AuditEventService auditEventService =
                new AuditEventService(auditEventRepository, auditEventConverter);
        AuditResource auditResource = new AuditResource(auditEventService);
        this.restAuditMockMvc = MockMvcBuilders.standaloneSetup(auditResource).build();
    }

    @Before
    public void initTest() {
        auditEventRepository.deleteAll();
        auditEvent = new PersistentAuditEvent();
        auditEvent.setAuditEventType(SAMPLE_TYPE);
        auditEvent.setPrincipal(SAMPLE_PRINCIPAL);
        auditEvent.setAuditEventDate(SAMPLE_TIMESTAMP);
    }


    @Test
    public void getAllAudits() throws Exception {
        // Initialize the database
        auditEventRepository.save(auditEvent);

        // Get all the audits
        restAuditMockMvc.perform(get("/api/audits"))
                .andExpect(status().isOk())
                // .andDo(print())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].principal").value(hasItem(SAMPLE_PRINCIPAL)));
    }

    @Test
    public void getAudit() throws Exception {
        // Initialize the database
        auditEventRepository.save(auditEvent);

        // Get the audit
        restAuditMockMvc.perform(get("/api/audits/{id}", auditEvent.getId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.principal").value(SAMPLE_PRINCIPAL));
    }

    @Test
    public void getNonExistingAudit() throws Exception {
        // Get the audit
        restAuditMockMvc.perform(get("/api/audits/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

}
