# Use the official SonarQube 25.12.0 community image
FROM sonarqube:25.12.0.117093-community

# Define version and plugin JAR name as environment variables
# renovate: datasource=github-releases depName=sonarqube-community-branch-plugin packageName=mc1arke/sonarqube-community-branch-plugin
ENV SONAR_PLUGIN_VERSION=25.9.0
ENV SONAR_PLUGIN_JAR=sonarqube-community-branch-plugin-${SONAR_PLUGIN_VERSION}.jar
ENV COMMONS_LANG_VERSION=2.6

# Download and place the SonarQube Community Branch Plugin and missing dependency
RUN mkdir -p /opt/sonarqube/extensions/plugins /opt/sonarqube/lib/common \
    && curl -L -o /opt/sonarqube/extensions/plugins/${SONAR_PLUGIN_JAR} https://github.com/mc1arke/sonarqube-community-branch-plugin/releases/download/${SONAR_PLUGIN_VERSION}/${SONAR_PLUGIN_JAR} \
    && curl -L -o /opt/sonarqube/lib/common/commons-lang-${COMMONS_LANG_VERSION}.jar https://repo1.maven.org/maven2/commons-lang/commons-lang/${COMMONS_LANG_VERSION}/commons-lang-${COMMONS_LANG_VERSION}.jar

# Set environment variables for SonarQube configurations
ENV SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true \
    SONAR_WEB_JAVAADDITIONALOPTS="-javaagent:./extensions/plugins/${SONAR_PLUGIN_JAR}=web" \
    SONAR_CE_JAVAADDITIONALOPTS="-javaagent:./extensions/plugins/${SONAR_PLUGIN_JAR}=ce"

# Expose SonarQube's default port
EXPOSE 9000
