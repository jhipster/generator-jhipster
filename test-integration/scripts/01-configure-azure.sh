#!/usr/bin/env bash

set -e
source $(dirname $0)/00-init-env.sh

if [[ "$JHI_PROFILE" == "" ]]; then
    echo "##vso[task.setvariable variable=JHI_PROFILE]dev"
fi
if [[ "$JHI_RUN_APP" == "" ]]; then
    echo "##vso[task.setvariable variable=JHI_RUN_APP]1"
fi
if [[ "$JHI_E2E" == "" ]]; then
    echo "##vso[task.setvariable variable=JHI_E2E]0"
fi

# https://github.com/actions/virtual-environments/blob/main/images/linux/Ubuntu2004-README.md#java
echo "*** Using OpenJDK 17"
sudo add-apt-repository ppa:openjdk-r/ppa -y
sudo apt-get update -q
sudo apt-get install -y openjdk-17-jdk
ls /usr/lib/jvm/ -la
sudo update-java-alternatives -s java-1.17.0-openjdk-amd64
echo "##vso[task.setvariable variable=JAVA_HOME]/usr/lib/jvm/java-17-openjdk-amd64"
# Use java backward compatible locale values https://bugs.openjdk.java.net/browse/JDK-8267069
echo "##vso[task.setvariable variable=java.locale.useOldISOCodes]true"
java -version
javadoc --version

echo "##vso[task.setvariable variable=SPRING_OUTPUT_ANSI_ENABLED]NEVER"
echo "##vso[task.setvariable variable=SPRING_JPA_SHOW_SQL]false"
echo "##vso[task.setvariable variable=JHI_DISABLE_WEBPACK_LOGS]true"
echo "##vso[task.setvariable variable=JHI_E2E_HEADLESS]true"
echo "##vso[task.setvariable variable=NG_CLI_ANALYTICS]false"
# https://github.com/actions/virtual-environments/issues/1499#issuecomment-689467080
echo "##vso[task.setvariable variable=MAVEN_OPTS]-Dhttp.keepAlive=false -Dmaven.wagon.http.pool=false -Dmaven.wagon.httpconnectionManager.ttlSeconds=120"

echo "##vso[task.setvariable variable=JHI_FOLDER_APP]$JHI_FOLDER_APP"
echo "##vso[task.setvariable variable=JHI_JDK]$JHI_JDK"
echo "##vso[task.setvariable variable=JHI_NODE_VERSION]$JHI_NODE_VERSION"
echo "##vso[task.setvariable variable=JHI_NPM_VERSION]$JHI_NPM_VERSION"
