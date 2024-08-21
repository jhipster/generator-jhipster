# Use the official SonarQube 10.6.0 community image as the base
FROM sonarqube:10.6.0-community

# Define version and plugin JAR name as environment variables
# renovate: datasource=github-releases depName=sonarqube-community-branch-plugin packageName=mc1arke/sonarqube-community-branch-plugin
ENV SONAR_PLUGIN_VERSION=1.21.0
ENV SONAR_PLUGIN_JAR=sonarqube-community-branch-plugin-${SONAR_PLUGIN_VERSION}.jar

# Download and place the SonarQube Community Branch Plugin in the correct directory
RUN mkdir -p /opt/sonarqube/extensions/plugins \
    && curl -L -o /opt/sonarqube/extensions/plugins/${SONAR_PLUGIN_JAR} https://github.com/mc1arke/sonarqube-community-branch-plugin/releases/download/${SONAR_PLUGIN_VERSION}/${SONAR_PLUGIN_JAR}

# Set environment variables for SonarQube configurations
ENV SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
    SONAR_WEB_JAVAADDITIONALOPTS="-javaagent:./extensions/plugins/${SONAR_PLUGIN_JAR}=web" \
    SONAR_CE_JAVAADDITIONALOPTS="-javaagent:./extensions/plugins/${SONAR_PLUGIN_JAR}=ce"

# Expose SonarQube's default port
EXPOSE 9000
