#!/usr/bin/env bash

set -e
source $(dirname $0)/00-init-env.sh

#-------------------------------------------------------------------------------
# Force no insight
#-------------------------------------------------------------------------------
if [ "$JHI_FOLDER_APP" == "$HOME/app" ]; then
    mkdir -p "$HOME"/.config/configstore/
    cp "$JHI_INTEG"/configstore/*.json "$HOME"/.config/configstore/
fi

if [[ "$JHI_ENTITY" == "jdl" ]]; then
    #-------------------------------------------------------------------------------
    # Generate with JDL
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"
    IFS=','
    for i in `echo "$JHI_APP"`
    do
        cp -f "$JHI_SAMPLES"/"$i"/*.jdl "$JHI_FOLDER_APP"/
    done
    cd "$JHI_FOLDER_APP"
    ls -la "$JHI_FOLDER_APP"/
    eval "$JHI_CLI import-jdl *.jdl --no-insight $@"

elif [[ "$JHI_APP" == "jdl" ]]; then
    #-------------------------------------------------------------------------------
    # Generate project with jhipster using jdl
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"

    IFS=','
    for i in `echo "$JHI_JDL_APP"`
    do
        if [[ -f "$i" ]]; then
            cp -f "$i" "$JHI_FOLDER_APP"/

        elif [[ -d "$i" ]]; then
            cp -f "$i"/*.jdl "$JHI_FOLDER_APP"/

        elif [[ -d "$JHI_SAMPLES/jdl-entities/$i" ]]; then
            cp -f "$JHI_SAMPLES/jdl-entities/$i/*.jdl" "$JHI_FOLDER_APP"/

        elif [[ -f "$JHI_SAMPLES/jdl-entities/$i.jdl" ]]; then
            cp -f "$JHI_SAMPLES/jdl-entities/$i.jdl" "$JHI_FOLDER_APP"/

        else
            cp -f "$JHI_JDL_SAMPLES"/"$i"/*.jdl "$JHI_FOLDER_APP"/
        fi
    done

    ls -la "$JHI_FOLDER_APP"/

    cd "$JHI_FOLDER_APP"
    eval "$JHI_CLI import-jdl *.jdl --no-insight $@"

else
    #-------------------------------------------------------------------------------
    # Generate project with jhipster
    #-------------------------------------------------------------------------------
    mkdir -p "$JHI_FOLDER_APP"

    if [[ "$JHI_GENERATE_SKIP_CONFIG" != "1" ]]; then
        cp -f "$JHI_SAMPLES"/"$JHI_APP"/.yo-rc.json "$JHI_FOLDER_APP"/
    else
        echo "skipping config file"
    fi

    cd "$JHI_FOLDER_APP"
    eval "$JHI_CLI --force --no-insight --skip-checks --with-entities $@"

fi

#-------------------------------------------------------------------------------
# Check folder where the app is generated
#-------------------------------------------------------------------------------
ls -al "$JHI_FOLDER_APP"
git --no-pager log -n 10 --graph --pretty='%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit || true
