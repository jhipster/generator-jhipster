#!/usr/bin/env bash
if [ "$TRAVIS_BRANCH" = 'master' ] && [ "$TRAVIS_PULL_REQUEST" == 'false' ]; then
  git checkout -B "$TRAVIS_BRANCH"
  ./mvnw -f .mvn/parent/pom.xml --batch-mode release:prepare -P release -DdryRun=true
  ./mvnw -f .mvn/parent/pom.xml --batch-mode release:clean -P release
  ./mvnw site
  ./mvnw -f .mvn/parent/pom.xml --batch-mode release:prepare -P release
  ./mvnw -f .mvn/parent/pom.xml --batch-mode release:perform -P release,nexus-pro
fi
