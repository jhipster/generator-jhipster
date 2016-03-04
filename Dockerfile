FROM isuper/java-oracle:jdk_8

# configure the "jhipster" user
RUN \
  groupadd jhipster && \
  useradd jhipster -s /bin/bash -m -g jhipster -G sudo && \
  echo 'jhipster:jhipster' |chpasswd && \
  mkdir /home/jhipster/app

COPY . /home/jhipster/generator-jhipster

RUN \
  # install utilities & node.js
  curl -sL https://deb.nodesource.com/setup_4.x | sudo bash - && \
  apt-get update && \
  apt-get install -y \
     wget \
     vim \
     git \
     zip \
     bzip2 \
     fontconfig \
     python \
     g++ \
     build-essential \
     nodejs && \

  # upgrade npm
  npm install -g npm && \

  # install yeoman bower gulp jhipster
  npm install -g \
    yo \
    bower \
    gulp-cli \
    /home/jhipster/generator-jhipster && \

  chown -R jhipster:jhipster \
    /home/jhipster \
    /usr/lib/node_modules && \

  # cleanup
  apt-get clean && \
  rm -rf \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/*

# expose the working directory, the Tomcat port, the BrowserSync ports
USER jhipster
WORKDIR "/home/jhipster/app"
VOLUME ["/home/jhipster/app"]
EXPOSE 8080 3000 3001
CMD ["tail", "-f", "/home/jhipster/generator-jhipster/generators/server/templates/src/main/resources/banner-no-color.txt"]
