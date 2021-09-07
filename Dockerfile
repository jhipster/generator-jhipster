# syntax=docker/dockerfile:1
FROM eclipse-temurin:11-focal
RUN \
  # configure the "jhipster" user
  groupadd jhipster && \
  useradd jhipster -s /bin/bash -m -g jhipster -G sudo && \
  echo 'jhipster:jhipster' |chpasswd && \
  mkdir /home/jhipster/app && \
  export DEBIAN_FRONTEND=noninteractive && \
  export TZ=Europe\Paris && \
  ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
  apt-get update && \
  # install utilities
  apt-get --no-install-recommends install -y \
    wget \
    curl \
    vim \
    git \
    zip \
    bzip2 \
    fontconfig \
    libpng-dev \
    sudo && \
  ARCH="$(dpkg --print-architecture)"; \
  case "${ARCH}" in \
     aarch64|arm64) \
       NODE_BINARY_URL='https://nodejs.org/dist/v16.8.0/node-v16.8.0-linux-arm64.tar.gz'; \
       ;; \
     amd64|x86_64) \
       NODE_BINARY_URL='https://nodejs.org/dist/v14.16.0/node-v14.16.0-linux-x64.tar.gz'; \
       ;; \
     *) \
       echo "Unsupported arch: ${ARCH}"; \
       exit 1; \
       ;; \
  esac; \
  wget $NODE_BINARY_URL -O /tmp/node.tar.gz && \
  tar -C /usr/local --strip-components 1 -xzf /tmp/node.tar.gz && \
  # upgrade npm
  npm install -g npm@latest && \
  # install yeoman
  npm install -g yo && \
  # cleanup
  apt-get clean && \
  rm -rf \
    /home/jhipster/.cache/ \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/*

# copy sources
COPY . /home/jhipster/generator-jhipster

RUN \
  # install jhipster
  cd /home/jhipster/generator-jhipster && npm ci --production && \
  npm install -g /home/jhipster/generator-jhipster && \
  # fix jhipster user permissions
  chown -R jhipster:jhipster \
    /home/jhipster \
    /usr/local/lib/node_modules && \
  # cleanup
  rm -rf \
    /home/jhipster/.cache/ \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/*

# expose the working directory, the Tomcat port, the BrowserSync ports
USER jhipster
ENV PATH $PATH:/usr/bin
WORKDIR "/home/jhipster/app"
VOLUME ["/home/jhipster/app"]
EXPOSE 8080 9000 3001
CMD ["tail", "-f", "/home/jhipster/generator-jhipster/generators/server/templates/src/main/resources/banner-no-color.txt"]
