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
  echo "::set-output name=angular::false"
  echo "::set-output name=react::false"
  echo "::set-output name=vue::false"
  echo "::set-output name=client-common::false"

  echo "::set-output name=workflow-angular::false"
  echo "::set-output name=workflow-react::false"
  echo "::set-output name=workflow-vue::false"

  echo "::set-output name=client::${CLIENT}"
  echo "::set-output name=server::${SERVER}"
  echo "::set-output name=common::${COMMON}"
  echo "::set-output name=workspaces::${WORKSPACES}"
  echo "::set-output name=e2e::${E2E}"
  echo "::set-output name=any::${ANY}"
  echo "::set-output name=matrix::{}"
  exit 0
fi

if [[ "true" == "$SKIP_CHANGES_DETECTION" ]]; then
  echo "::set-output name=angular::true"
  echo "::set-output name=react::true"
  echo "::set-output name=vue::true"
  echo "::set-output name=client-common::true"

  echo "::set-output name=workflow-angular::true"
  echo "::set-output name=workflow-react::true"
  echo "::set-output name=workflow-vue::true"

  echo "::set-output name=client::true"
  echo "::set-output name=server::true"
  echo "::set-output name=common::true"
  echo "::set-output name=workspaces::true"
  echo "::set-output name=e2e::true"
  echo "::set-output name=any::true"
  echo "::set-output name=matrix::{}"
  exit 0
fi

echo "::group::Check Angular"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/angular' \
  || ANGULAR=true WORKFLOW_ANGULAR=true
echo "::endgroup::"

echo "::group::Check React"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/react' \
  || REACT=true WORKFLOW_REACT=true
echo "::endgroup::"

echo "::group::Check Vue"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/vue' \
  || VUE=true WORKFLOW_VUE=true
echo "::endgroup::"

echo "::group::Check Client Common"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/bootstrap-application-client' \
  'generators/client/**' \
  || CLIENT_COMMON=true
echo "::endgroup::"

echo "::group::Check Client"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/bootstrap-application-client' \
  'generators/client/**' \
  'generators/angular/**' \
  'generators/react/**' \
  'generators/vue/**' \
  || CLIENT=true ANY=true
echo "::endgroup::"

echo "::group::Check Server"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/bootstrap-application-server' \
  'generators/couchbase' \
  'generators/elasticsearch' \
  'generators/gradle' \
  'generators/kafka' \
  'generators/maven' \
  'generators/mongodb' \
  'generators/server' \
  'generators/sql' \
  'generators/database-changelog' \
  'generators/database-changelog-liquibase' \
  || SERVER=true ANY=true
echo "::endgroup::"

echo "::group::Check Common"
git -c color.ui=always diff --exit-code @~1 -- \
  '.github/actions' \
  '.github/workflows' \
  'generators/app' \
  'generators/base-application' \
  'generators/bootstrap-application' \
  'generators/bootstrap-application-base' \
  'generators/common' \
  'generators/languages' \
  'jdl' \
  'lib' \
  'test-integration' \
  'utils' \
  || CLIENT=true SERVER=true COMMON=true ANY=true
echo "::endgroup::"

echo "::group::Check Base"
git -c color.ui=always diff --exit-code @~1 -- \
  'generators/base' \
  'generators/base-application' \
  'generators/bootstrap' \
  'generators/bootstrap-application-base' \
  $(ls generators/*.*) \
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
  'generators/docker' \
  'generators/docker-compose' \
  || WORKSPACES=true ANY=true
echo "::endgroup::"

if [ "true" == "$SERVER" ] || [ "true" == "$CLIENT_COMMON" ] || [ "true" == "$COMMON" ] || [ "true" == "$WORKSPACES" ] || [ "true" == "$E2E" ]; then
  WORKFLOW_ANGULAR=true
  WORKFLOW_REACT=true
  WORKFLOW_VUE=true
fi

echo "::set-output name=angular::${ANGULAR}"
echo "::set-output name=react::${REACT}"
echo "::set-output name=vue::${VUE}"
echo "::set-output name=client-common::${CLIENT_COMMON}"

echo "::set-output name=workflow-angular::${WORKFLOW_ANGULAR}"
echo "::set-output name=workflow-react::${WORKFLOW_REACT}"
echo "::set-output name=workflow-vue::${WORKFLOW_VUE}"

echo "::set-output name=client::${CLIENT}"
echo "::set-output name=server::${SERVER}"
echo "::set-output name=common::${COMMON}"
echo "::set-output name=workspaces::${WORKSPACES}"
echo "::set-output name=e2e::${E2E}"
echo "::set-output name=any::${ANY}"
