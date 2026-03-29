# See here for image contents: https://github.com/microsoft/vscode-dev-containers/tree/v0.209.6/containers/java/.devcontainer/base.Dockerfile

# [Choice] Java version (use -bullseye variants on local arm64/Apple Silicon): 11, 17, 11-bullseye, 17-bullseye, 11-buster, 17-buster
ARG VARIANT="17-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/java:0-${VARIANT}

# [Choice] Node.js version: none, lts/*, defaults to generator-jhipster default node version.
ARG NODE_VERSION

# Copy required generator-jhipster resource to detect node and npm versions
COPY /package.json /tmp/generator-jhipster/
COPY /generators /tmp/generator-jhipster/generators

RUN export NODE_VERSION=${NODE_VERSION:-$(cat /tmp/generator-jhipster/generators/init/resources/.node-version)}; \
  su -p vscode -c "umask 0002 && . /usr/local/share/nvm/nvm.sh && nvm install $NODE_VERSION 2>&1";
RUN npm install -g npm@$(node -e "process.stdout.write(require('/tmp/generator-jhipster/generators/common/resources/package.json').devDependencies.npm)"); \
  npm cache clean --force

# Remove generator-jhipster for final image
RUN rm -rf /tmp/generator-jhipster
