FROM ubuntu:bionic

RUN \
  apt-get update && \
  # install utilities
  apt-get install -y \
    wget \
    curl \
    vim \
    git \
    zip \
    bzip2 \
    fontconfig \
    python \
    g++ \
    libpng-dev \
    build-essential \
    sudo && \
  # install node.js
  wget https://nodejs.org/dist/v10.15.3/node-v10.15.3-linux-x64.tar.gz -O /tmp/node.tar.gz && \
  tar -C /usr/local --strip-components 1 -xzf /tmp/node.tar.gz && \
  # upgrade npm
  npm install -g npm && \
  # install yarn
  npm install -g yarn && \
  # install yeoman
  npm install -g yo && \
  # cleanup
  apt-get clean && \
  rm -rf \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/*

# install open-jdk 11 using SDKMAN
RUN export SDKMAN_DIR="/usr/local/sdkman" && curl -s get.sdkman.io | bash && \
    echo sdkman_auto_answer=true > $SDKMAN_DIR/etc/config && \
    /bin/bash -c "source $SDKMAN_DIR/bin/sdkman-init.sh ; sdk install java 11.0.2-open"

# copy sources
COPY . /usr/local/generator-jhipster

RUN \
  # clean jhipster folder
  rm -Rf /usr/local/generator-jhipster/node_modules \
    /usr/local/generator-jhipster/yarn.lock \
    /usr/local/generator-jhipster/yarn-error.log && \
  # install jhipster
  npm install -g /usr/local/generator-jhipster && \
  # cleanup
  rm -rf \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/*

ENTRYPOINT ["/usr/local/generator-jhipster/docker-entrypoint.sh"]

EXPOSE 8080 9000 3001
CMD ["tail", "-f", "/usr/local/generator-jhipster/generators/server/templates/src/main/resources/banner-no-color.txt"]
