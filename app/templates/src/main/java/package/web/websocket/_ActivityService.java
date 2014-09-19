package <%=packageName%>.web.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import <%=packageName%>.web.websocket.dto.ActivityDTO;
import <%=packageName%>.web.websocket.dto.ActivityDTOJacksonDecoder;
import org.atmosphere.config.service.Disconnect;
import org.atmosphere.config.service.ManagedService;
import org.atmosphere.config.service.Message;
import org.atmosphere.cpr.*;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import javax.servlet.ServletContext;
import java.io.IOException;
import java.util.Calendar;

@ManagedService(
        path = "/websocket/activity")
public class ActivityService {

    private static final Logger log = LoggerFactory.getLogger(ActivityService.class);

    private Broadcaster b;

    private DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd HH:mm:ss");

    private ObjectMapper jsonMapper = new ObjectMapper();

    @Inject
    private ServletContext servletContext;

    @PostConstruct
    public void init() {
        AtmosphereFramework atmosphereFramework = (AtmosphereFramework) servletContext.getAttribute("AtmosphereServlet");
        this.b = atmosphereFramework.getBroadcasterFactory().lookup("/websocket/tracker", true);
    }

    @Disconnect
    public void onDisconnect(AtmosphereResourceEvent event) throws IOException {
        log.debug("Browser {} disconnected", event.getResource().uuid());
        AtmosphereRequest request = event.getResource().getRequest();
        ActivityDTO activityDTO = new ActivityDTO();
        activityDTO.setUuid(event.getResource().uuid());
        activityDTO.setPage("logout");
        String json = jsonMapper.writeValueAsString(activityDTO);
        b.broadcast(json);
    }

    @Message(decoders = {ActivityDTOJacksonDecoder.class})
    public void onMessage(AtmosphereResource atmosphereResource, ActivityDTO activityDTO) throws IOException {
        if (activityDTO.getUserLogin() != null){
            AtmosphereRequest request = atmosphereResource.getRequest();
            activityDTO.setUuid(atmosphereResource.uuid());
            activityDTO.setIpAddress(request.getRemoteAddr());
            activityDTO.setTime(dateTimeFormatter.print(Calendar.getInstance().getTimeInMillis()));
            String json = jsonMapper.writeValueAsString(activityDTO);
            log.debug("Sending user tracking data {}", json);
            b.broadcast(json);
        }
    }
}
