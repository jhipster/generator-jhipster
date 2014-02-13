package <%=packageName%>.web.rest;

import <%=packageName%>.service.AuditEventService;
import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.boot.actuate.audit.AuditEvent;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.*;

import javax.inject.Inject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

/**
 * REST controller for getting the audit events.
 */
@RestController
@RequestMapping("/app")
public class AuditResource {

    @Inject
    private AuditEventService auditEventService;

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
        binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, false));
    }

    @RequestMapping(value = "/rest/audits",
            method = RequestMethod.GET,
            produces = "application/json")
    public List<AuditEvent> getList(@RequestParam(value = "fromDate", required = false) Date fromDate,
                                    @RequestParam(value = "toDate", required = false) Date toDate) {
        if (fromDate == null && toDate == null) {
            return auditEventService.find(null, null);
        }

        return auditEventService.findBetweenDate(fromDate, toDate);
    }

    @RequestMapping(value = "/rest/audits/{principal}",
            method = RequestMethod.GET,
            produces = "application/json")
    public List<AuditEvent> getList(@PathVariable String principal,
                                    @RequestParam(value = "after", required = false) Date after) {
        return auditEventService.find(principal, after);
    }
}
