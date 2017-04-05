FROM ubuntu:xenial

RUN \
  # configure the "jhipster" user
  groupadd jhipster && \
  useradd jhipster -s /bin/bash -m -g jhipster -G sudo && \
  echo 'jhipster:jhipster' |chpasswd && \
  mkdir /home/jhipster/app && \

  # install open-jdk 8
  apt-get update && \
  apt-get install -y openjdk-8-jdk && \

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
    build-essential && \

  # install node.js
  curl -sL https://deb.nodesource.com/setup_6.x | bash && \
  apt-get install -y nodejs && \

  # upgrade npm
  npm install -g npm && \

  # install yarn
  npm install -g yarn && \
  su -c "yarn config set prefix /home/jhipster/.yarn-global" jhipster && \

  # install yeoman bower gulp
  su -c "yarn global add yo bower gulp-cli" jhipster && \

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
  # fix jhipster user permissions
  chown -R jhipster:jhipster \
    /home/jhipster \
    /usr/lib/node_modules && \

  # install jhipster
  rm -Rf /home/jhipster/generator-jhipster/node_modules \
    /home/jhipster/generator-jhipster/yarn.lock \
    /home/jhipster/generator-jhipster/yarn-error.log && \
  su -c "cd /home/jhipster/generator-jhipster && yarn install" jhipster && \
  su -c "yarn global add file:/home/jhipster/generator-jhipster" jhipster && \

  # cleanup
  rm -rf \
    /home/jhipster/.cache/ \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/*

# expose the working directory, the Tomcat port, the BrowserSync ports
USER jhipster
ENV PATH $PATH:/usr/bin:/home/jhipster/.yarn-global/bin:/home/jhipster/.yarn/bin:/home/jhipster/.config/yarn/global/node_modules/.bin
WORKDIR "/home/jhipster/app"
VOLUME ["/home/jhipster/app"]
EXPOSE 8080 9000 3001
CMD ["tail", "-f", "/home/jhipster/generator-jhipster/generators/server/templates/src/main/resources/banner-no-color.txt"]
