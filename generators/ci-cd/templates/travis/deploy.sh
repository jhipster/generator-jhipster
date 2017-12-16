#!/usr/bin/env bash
if [ "$TRAVIS_BRANCH" = 'master' ] && [ "$TRAVIS_PULL_REQUEST" == 'false' ]; then
  git checkout -B "$TRAVIS_BRANCH"
  ./mvnw -f .mvn/parent/pom.xml --batch-mode release:prepare -DdryRun=true
  ./mvnw -f .mvn/parent/pom.xml --batch-mode release:clean
  ./mvnw site
  ./mvnw -f .mvn/parent/pom.xml --batch-mode release:prepare
  ./mvnw -f .mvn/parent/pom.xml --batch-mode release:perform -P nexus-pro
fi
