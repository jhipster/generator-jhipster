package <%=packageName%>.web.rest.dto;

<% if (loggingImpl == 'log4j2') { %>
import org.apache.logging.log4j.Logger;<% } else { %>
import ch.qos.logback.classic.Logger;<% } %>
import com.fasterxml.jackson.annotation.JsonCreator;

public class LoggerDTO {

    private String name;

    private String level;

    public LoggerDTO(Logger logger) {
        this.name = logger.getName();<% if (loggingImpl == 'log4j2') { %>
        this.level = logger.getLevel().toString();<% } else { %>
        this.level = logger.getEffectiveLevel().toString();<% } %>
    }

    @JsonCreator
    public LoggerDTO() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    @Override
    public String toString() {
        return "LoggerDTO{" +
            "name='" + name + '\'' +
            ", level='" + level + '\'' +
            '}';
    }
}
