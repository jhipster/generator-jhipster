package <%=packageName%>.config;

import <%=packageName%>.config.audit.AuditEventConverter;
import <%=packageName%>.domain.PersistentAuditEvent;
import <%=packageName%>.repository.PersistenceAuditEventRepository;
import org.joda.time.LocalDateTime;
import org.springframework.boot.actuate.audit.AuditEvent;
import org.springframework.boot.actuate.audit.AuditEventRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Configuration
public class AuditEventConfiguration {

    @Inject
    private PersistenceAuditEventRepository persistenceAuditEventRepository;

    @Bean
    public AuditEventRepository auditEventRepository() {
        return new AuditEventRepository() {

            @Inject
            private AuditEventConverter auditEventConverter;

            @Override
            public List<AuditEvent> find(String principal, Date after) {
                List<AuditEvent> auditEvents = new ArrayList<>();

                final List<PersistentAuditEvent> persistentAuditEvents;
                if (principal == null && after == null) {
                    persistentAuditEvents = persistenceAuditEventRepository.findAll();
                } else if (after == null) {
                    persistentAuditEvents = persistenceAuditEventRepository.findByPrincipal(principal);
                } else {
                    persistentAuditEvents =
                            persistenceAuditEventRepository.findByPrincipalAndAuditEventDateGreaterThan(principal, new LocalDateTime(after));
                }

                if (persistentAuditEvents != null) {
                    for (PersistentAuditEvent persistentAuditEvent : persistentAuditEvents) {
                        AuditEvent auditEvent = new AuditEvent(persistentAuditEvent.getAuditEventDate().toDate(), persistentAuditEvent.getPrincipal(),
                                persistentAuditEvent.getAuditEventType(), auditEventConverter.convertDataToObjects(persistentAuditEvent.getData()));
                        auditEvents.add(auditEvent);
                    }
                }

                return auditEvents;
            }


            @Override
            public void add(AuditEvent event) {
                PersistentAuditEvent persistentAuditEvent = new PersistentAuditEvent();
                persistentAuditEvent.setPrincipal(event.getPrincipal());
                persistentAuditEvent.setAuditEventType(event.getType());
                persistentAuditEvent.setAuditEventDate(new LocalDateTime(event.getTimestamp()));
                persistentAuditEvent.setData(auditEventConverter.convertDataToStrings(event.getData()));

                persistenceAuditEventRepository.save(persistentAuditEvent);
            }
        };
    }

    @Bean
    public AuditEventConverter auditEventConverter() {
        return new AuditEventConverter();
    }

}
