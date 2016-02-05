package <%=packageName%>.web.rest;

import <%=packageName%>.web.rest.dto.LoggerDTO;

<% if (loggingImpl == 'log4j2') { %>
import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.core.config.Configuration;
import org.apache.logging.log4j.core.config.LoggerConfig;
import org.apache.logging.log4j.core.LoggerContext;<% } else { %>
import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.LoggerContext;
import org.slf4j.LoggerFactory;<% } %>

import com.codahale.metrics.annotation.Timed;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Controller for view and managing Log Level at runtime.
 */
@RestController
@RequestMapping("/api")
public class LogsResource {

    @RequestMapping(value = "/logs",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Timed
    public List<LoggerDTO> getList() {<% if (loggingImpl == 'log4j2') { %>
        LoggerContext context = (LoggerContext) LogManager.getContext(false);
        Configuration config = context.getConfiguration();
        return config.getLoggers().keySet()
            .stream()
            .map(LogManager::getLogger)
            .map(LoggerDTO::new)
            .collect(Collectors.toList());<% } else { %>
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        return context.getLoggerList()
            .stream()
            .map(LoggerDTO::new)
            .collect(Collectors.toList());<% } %>
    }

    @RequestMapping(value = "/logs",
        method = RequestMethod.PUT)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Timed
    public void changeLevel(@RequestBody LoggerDTO jsonLogger) {<% if (loggingImpl == 'log4j2') { %>
        LoggerContext context = (LoggerContext) LogManager.getContext(false);
        Configuration config = context.getConfiguration();
        LoggerConfig logger = config.getLoggerConfig(jsonLogger.getName());
        logger.setLevel(Level.toLevel(jsonLogger.getLevel()));
        context.updateLoggers();<% } else { %>
        LoggerContext context = (LoggerContext) LoggerFactory.getILoggerFactory();
        context.getLogger(jsonLogger.getName()).setLevel(Level.valueOf(jsonLogger.getLevel()));<% } %>
    }
}
