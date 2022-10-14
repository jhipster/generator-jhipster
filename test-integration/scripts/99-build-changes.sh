#!/usr/bin/env bash

CLIENT=false
CLIENT_COMMON=false
SERVER=false
COMMON=false
WORKSPACES=false
E2E=false
ANY=false

WORKFLOW_ANGULAR=false
WORKFLOW_REACT=false
WORKFLOW_VUE=false

if [[ "true" == "$SKIP_WORKFLOW" ]]; then
  echo "angular=false" >> $GITHUB_OUTPUT
  echo "react=false" >> $GITHUB_OUTPUT
  echo "vue=false" >> $GITHUB_OUTPUT
  echo "client-common=false" >> $GITHUB_OUTPUT

  echo "workflow-angular=false" >> $GITHUB_OUTPUT
  echo "workflow-react=false" >> $GITHUB_OUTPUT
  echo "workflow-vue=false" >> $GITHUB_OUTPUT

  echo "client=${CLIENT}" >> $GITHUB_OUTPUT
  echo "server=${SERVER}" >> $GITHUB_OUTPUT
  echo "common=${COMMON}" >> $GITHUB_OUTPUT
  echo "workspaces=${WORKSPACES}" >> $GITHUB_OUTPUT
  echo "e2e=${E2E}" >> $GITHUB_OUTPUT
  echo "any=${ANY}" >> $GITHUB_OUTPUT
  echo "matrix={}" >> $GITHUB_OUTPUT
  exit 0
fi

if [[ "true" == "$SKIP_CHANGES_DETECTION" ]]; then
  echo "angular=true" >> $GITHUB_OUTPUT
  echo "react=true" >> $GITHUB_OUTPUT
  echo "vue=true" >> $GITHUB_OUTPUT
  echo "client-common=true" >> $GITHUB_OUTPUT

  echo "workflow-angular=true" >> $GITHUB_OUTPUT
  echo "workflow-react=true" >> $GITHUB_OUTPUT
  echo "workflow-vue=true" >> $GITHUB_OUTPUT

  echo "client=true" >> $GITHUB_OUTPUT
  echo "server=true" >> $GITHUB_OUTPUT
  echo "common=true" >> $GITHUB_OUTPUT
  echo "workspaces=true" >> $GITHUB_OUTPUT
  echo "e2e=true" >> $GITHUB_OUTPUT
  echo "any=true" >> $GITHUB_OUTPUT
  echo "matrix={}" >> $GITHUB_OUTPUT
  exit 0
fi

echo "::group::Check Angular"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/*client/**/angular/**' \
  'generators/*client/**/*-angular*' \
  || ANGULAR=true WORKFLOW_ANGULAR=true
echo "::endgroup::"

echo "::group::Check React"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/*client/**/react/**' \
  'generators/*client/**/*-react*' \
  || REACT=true WORKFLOW_REACT=true
echo "::endgroup::"

echo "::group::Check Vue"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/*client/**/vue/**' \
  'generators/*client/**/*-vue*' \
  || VUE=true WORKFLOW_VUE=true
echo "::endgroup::"

echo "::group::Check Client Common"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/*client/**' \
  ':^*-angular*' \
  ':^**/angular/**' \
  ':^*-react*' \
  ':^**/react/**' \
  ':^*-vue*' \
  ':^**/vue/**' \
  || CLIENT_COMMON=true
echo "::endgroup::"

echo "::group::Check Client"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/*client/**' \
  || CLIENT=true ANY=true
echo "::endgroup::"

echo "::group::Check Server"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/*server/**' \
  'generators/database-changelog' \
  'generators/database-changelog-liquibase' \
  || SERVER=true ANY=true
echo "::endgroup::"

echo "::group::Check Common"
git -c color.ui=always diff --exit-code @~1 -- \
  '.github/actions' \
  '.github/workflows' \
  'generators/app' \
  'generators/bootstrap' \
  'generators/common' \
  'generators/entities' \
  'generators/entity' \
  'generators/gradle' \
  'generators/languages' \
  'generators/maven' \
  'jdl' \
  'lib' \
  'test-integration' \
  'utils' \
  || CLIENT=true SERVER=true COMMON=true ANY=true
echo "::endgroup::"

echo "::group::Check Base"
git -c color.ui=always diff --exit-code @~1 -- $(ls generators/*.*) \
  || CLIENT=true SERVER=true COMMON=true ANY=true
echo "::endgroup::"

echo "::group::Check E2E"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/cypress' \
  || E2E=true ANY=true
echo "::endgroup::"

echo "::group::Check Workspaces"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/workspaces' \
  'generators/docker-compose' \
  || WORKSPACES=true ANY=true
echo "::endgroup::"

if [ "true" == "$SERVER" ] || [ "true" == "$CLIENT_COMMON" ] || [ "true" == "$COMMON" ] || [ "true" == "$WORKSPACES" ] || [ "true" == "$E2E" ]; then
  WORKFLOW_ANGULAR=true
  WORKFLOW_REACT=true
  WORKFLOW_VUE=true
fi

echo "angular=${ANGULAR}" >> $GITHUB_OUTPUT
echo "react=${REACT}" >> $GITHUB_OUTPUT
echo "vue=${VUE}" >> $GITHUB_OUTPUT
echo "client-common=${CLIENT_COMMON}" >> $GITHUB_OUTPUT

echo "workflow-angular=${WORKFLOW_ANGULAR}" >> $GITHUB_OUTPUT
echo "workflow-react=${WORKFLOW_REACT}" >> $GITHUB_OUTPUT
echo "workflow-vue=${WORKFLOW_VUE}" >> $GITHUB_OUTPUT

echo "client=${CLIENT}" >> $GITHUB_OUTPUT
echo "server=${SERVER}" >> $GITHUB_OUTPUT
echo "common=${COMMON}" >> $GITHUB_OUTPUT
echo "workspaces=${WORKSPACES}" >> $GITHUB_OUTPUT
echo "e2e=${E2E}" >> $GITHUB_OUTPUT
echo "any=${ANY}" >> $GITHUB_OUTPUT
