package <%=packageName%>.service;

import <%=packageName%>.config.audit.AuditEventConverter;
import <%=packageName%>.domain.PersistentAuditEvent;
import <%=packageName%>.repository.PersistenceAuditEventRepository;
import org.joda.time.LocalDateTime;
import org.springframework.boot.actuate.audit.AuditEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Service for managing audit event.
 * <p/>
 * <p>
 * This is the default implementation to support SpringBoot Actuator AuditEventRepository
 * </p>
 */
@Service
@Transactional
public class AuditEventService {

    @Inject
    private PersistenceAuditEventRepository persistenceAuditEventRepository;

    @Inject
    private AuditEventConverter auditEventConverter;

    public List<AuditEvent> find(String principal, Date after) {
        List<AuditEvent> auditEvents = new ArrayList<>();

        final List<PersistentAuditEvent> persistentAuditEvents;
        if (principal == null && after == null) {
            persistentAuditEvents = persistenceAuditEventRepository.findAll();
        } else if (after == null) {
            persistentAuditEvents = persistenceAuditEventRepository.findByPrincipal(principal);
        } else {
            persistentAuditEvents = persistenceAuditEventRepository.findByPrincipalAndAuditEventDateGreaterThan(principal, new LocalDateTime(after));
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

    public List<AuditEvent> findBetweenDate(Date fromDate, Date toDate) {
        List<AuditEvent> auditEvents = new ArrayList<>();

        final List<PersistentAuditEvent> persistentAuditEvents =
                persistenceAuditEventRepository.findByAuditEventDateBetween(new LocalDateTime(fromDate), new LocalDateTime(toDate));
        if (persistentAuditEvents != null) {
            for (PersistentAuditEvent persistentAuditEvent : persistentAuditEvents) {
                AuditEvent auditEvent = new AuditEvent(persistentAuditEvent.getAuditEventDate().toDate(), persistentAuditEvent.getPrincipal(),
                        persistentAuditEvent.getAuditEventType(), auditEventConverter.convertDataToObjects(persistentAuditEvent.getData()));
                auditEvents.add(auditEvent);
            }
        }

        return auditEvents;
    }
}
