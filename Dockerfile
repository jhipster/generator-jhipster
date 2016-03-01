FROM ubuntu:trusty

# environment variables
ENV JAVA_VERSION 8
ENV JAVA_HOME /usr/lib/jvm/java-8-oracle

ENV MAVEN_VERSION 3.3.9
ENV MAVEN_HOME /usr/share/maven
ENV PATH "$PATH:$MAVEN_HOME/bin"

# install utilities
RUN apt-get -y install wget vim git sudo zip bzip2 fontconfig curl

# install maven
RUN wget -O /tmp/apache-maven-${MAVEN_VERSION}-bin.tar.gz http://archive.apache.org/dist/maven/maven-3/${MAVEN_VERSION}/binaries/apache-maven-${MAVEN_VERSION}-bin.tar.gz
RUN echo "516923b3955b6035ba6b0a5b031fbd8b /tmp/apache-maven-${MAVEN_VERSION}-bin.tar.gz" | md5sum -c
RUN tar xzf /tmp/apache-maven-${MAVEN_VERSION}-bin.tar.gz -C /opt/

# install java8
RUN echo "deb http://ppa.launchpad.net/webupd8team/java/ubuntu trusty main" >> /etc/apt/sources.list && \
    echo "deb-src http://ppa.launchpad.net/webupd8team/java/ubuntu trusty main" >> /etc/apt/sources.list && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys C2518248EEA14886 && \
    apt-get update && \
    echo oracle-java${JAVA_VERSION}-installer shared/accepted-oracle-license-v1-1 select true | sudo /usr/bin/debconf-set-selections && \
    apt-get install -y --force-yes --no-install-recommends oracle-java${JAVA_VERSION}-installer oracle-java${JAVA_VERSION}-set-default

# install node.js
RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo bash -
RUN apt-get install -y nodejs python g++ build-essential

# install yeoman bower grunt gulp
RUN npm install -g yo bower grunt-cli gulp-cli

# clean
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/cache/oracle-jdk${JAVA_VERSION}-installer

# install JHipster
COPY . /home/jhipster/generator-jhipster
RUN npm install -g /home/jhipster/generator-jhipster/

# configure the "jhipster" user
RUN groupadd jhipster && useradd jhipster -s /bin/bash -m -g jhipster -G jhipster && adduser jhipster sudo
RUN echo 'jhipster:jhipster' |chpasswd
RUN mkdir -p /home/jhipster/app
RUN cd /home && chown -R jhipster:jhipster /home/jhipster
RUN chown -R jhipster:jhipster /usr/lib/node_modules/

# expose the working directory, the Tomcat port, the BrowserSync ports
USER jhipster
WORKDIR "/home/jhipster/app"
VOLUME ["/home/jhipster/app"]
EXPOSE 8080 3000 3001
CMD ["tail", "-f", "/home/jhipster/generator-jhipster/app/templates/src/main/resources/banner-no-color.txt"]
