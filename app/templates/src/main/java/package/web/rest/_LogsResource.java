package <%=packageName%>.web.rest;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.LoggerContext;
import com.codahale.metrics.annotation.Timed;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Controller for view and managing Log Level at runtime.
 */
@Controller
public class LogsResource {

    private static final org.slf4j.Logger log = LoggerFactory.getLogger(LogsResource.class);

    /**
     * DTO for managing logs.
     */
    class JsonLogger {
        public String name, level;

        JsonLogger(Logger logger) {
            this.name = logger.getName();
            this.level = logger.getEffectiveLevel().toString();
        }
    }

    @RequestMapping(value = "/rest/logs",
            method = RequestMethod.GET,
            produces = "application/json")
    @ResponseBody
    @Timed
    public List<JsonLogger> getList() {
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();

        List<JsonLogger> loggers = new ArrayList<JsonLogger>();
        for (Logger logger : context.getLoggerList()) {
            loggers.add(new JsonLogger(logger));
        }
        return loggers;
    }

    @RequestMapping(value = "/rest/logs/change/{loggerName}/{newLevel}",
            method = RequestMethod.GET)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Timed
    public void changeLevel(@PathVariable String loggerName, @PathVariable String newLevel) {
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        context.getLogger(loggerName).setLevel(Level.valueOf(newLevel));
    }
}
