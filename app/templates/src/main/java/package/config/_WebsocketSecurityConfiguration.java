package <%=packageName%>.config;

<%_ if (authenticationType == 'session' || authenticationType == 'oauth2') { _%>
import <%=packageName%>.security.AuthoritiesConstants;
<%_ } _%>
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry;
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer;

@Configuration
public class WebsocketSecurityConfiguration extends AbstractSecurityWebSocketMessageBrokerConfigurer {

    @Override
    protected void configureInbound(MessageSecurityMetadataSourceRegistry messages) {
        messages
            // message types other than MESSAGE and SUBSCRIBE
            .nullDestMatcher().authenticated()
            // matches any destination that starts with /rooms/
            <%_ if (authenticationType == 'session' || authenticationType == 'oauth2') { // ignoring authentiation check for authenticationType == 'xauth' since it does not work, see issue #2129 _%>
            .simpDestMatchers("/topic/tracker").hasAuthority(AuthoritiesConstants.ADMIN)
            <%_ } _%>
            .simpDestMatchers("/topic/**").authenticated()
            // (i.e. cannot send messages directly to /topic/, /queue/)
            // (i.e. cannot subscribe to /topic/messages/* to get messages sent to
            // /topic/messages-user<id>)
            .simpTypeMatchers(SimpMessageType.MESSAGE, SimpMessageType.SUBSCRIBE).denyAll()
            // catch all
            .anyMessage().denyAll();
    }

    /**
     * Disables CSRF for Websockets.
     */
    @Override
    protected boolean sameOriginDisabled() {
        return true;
    }
}
