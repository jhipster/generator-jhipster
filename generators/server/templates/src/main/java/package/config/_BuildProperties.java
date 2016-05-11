package <%=packageName%>.config;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This class serves as a channel for <%= buildTool %> to pass properties from the build to the runtime.
 * <p>
 * In particular, it is used to "promote" the profile(s) used during the build to be the default profile(s) when
 * booting the Spring environment (activated when no explicit <code>spring.profiles.active</code> are given).
 */
public final class BuildProperties extends Properties {

    private static final long serialVersionUID = 1L;

    /**
     * The singleton instance.
     */
    private static final Properties BUILD_PROPERTIES = new BuildProperties();

    /**
     * Return the profile(s) that were active during the build.
     */
    public static final String[] getDefaultProfiles() {
        return getBuildProperty("spring.profiles.default", Constants.SPRING_PROFILE_DEVELOPMENT).split("\\s*,\\s*");
    }

    private static final String getBuildProperty(String key, String defaultValue) {
        return BUILD_PROPERTIES.getProperty(key, defaultValue);
    }


    private final Logger log = LoggerFactory.getLogger(BuildProperties.class);

    private BuildProperties() {
        try (InputStream in = getClass().getClassLoader().getResourceAsStream(".build-properties.xml");
                BufferedInputStream bin = new BufferedInputStream(in)) {

            this.loadFromXML(bin);
        } catch (IOException e) {
            log.error("Failed to read build properties", e);
        }
    }

    @Override
    public String getProperty(String key, String defaultValue) {
        String value = super.getProperty(key, null);
        return value != null && !value.equals("@" + key + "@") ? value : defaultValue;
    }
}
