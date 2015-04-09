package com.mycompany.myapp.repository;

import com.mycompany.myapp.config.audit.AuditEventConverter;
import com.mycompany.myapp.domain.PersistentAuditEvent;
import org.joda.time.LocalDateTime;
import org.springframework.boot.actuate.audit.AuditEvent;
import org.springframework.boot.actuate.audit.AuditEventRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.util.Date;
import java.util.List;

/**
 * Wraps an implementation of Spring Boot's AuditEventRepository.
 */
@Repository
public class CustomAuditEventRepository {

    @Inject
    private PersistenceAuditEventRepository persistenceAuditEventRepository;

    @Bean
    public AuditEventRepository auditEventRepository() {
        return new AuditEventRepository() {

            @Inject
            private AuditEventConverter auditEventConverter;

            @Override
            public List<AuditEvent> find(String principal, Date after) {
                Iterable<PersistentAuditEvent> persistentAuditEvents;
                if (principal == null && after == null) {
                    persistentAuditEvents = persistenceAuditEventRepository.findAll();
                } else if (after == null) {
                    persistentAuditEvents = persistenceAuditEventRepository.findByPrincipal(principal);
                } else {
                    persistentAuditEvents =
                            persistenceAuditEventRepository.findByPrincipalAndAuditEventDateAfter(principal, new LocalDateTime(after));
                }
                return auditEventConverter.convertToAuditEvent(persistentAuditEvents);
            }

            @Override
            @Transactional(propagation = Propagation.REQUIRES_NEW)
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
}
