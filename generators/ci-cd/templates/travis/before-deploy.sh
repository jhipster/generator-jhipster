#!/usr/bin/env bash
if [ "$TRAVIS_BRANCH" = 'master' ] && [ "$TRAVIS_PULL_REQUEST" == 'false' ]; then
## Please read before using travis
#
# You can disable continuous deployment within .travis.yml
#
# Otherwise, this is what you've to do
#
# - Generate a gpg encrypting subkey: http://www.debonair.io/post/maven-cd/
# - Generate a git ssh key for your git repository, and configure it to accept the communication https://oncletom.io/2016/travis-ssh-deploy/, also add the public one on github deploy repo deploy key
# - Tar all and encrypt them https://docs.travis-ci.com/user/encrypting-files/#Encrypting-multiple-files
# Update informations below according to the name you gave them
    openssl aes-256-cbc -K $encrypted_aa444281d1e4_key -iv $encrypted_aa444281d1e4_iv -in travis/deploykeys.tar.enc -out travis/deploykeys.tar -d
    tar -xvf travis/deploykeys.tar
    gpg --fast-import .ssh/travisgpg.asc
    mv .ssh/ssh_travis ~/.ssh/id_rsa
    mv .ssh/ssh_travis.pub ~/.ssh/id_rsa.pub
    chmod 600 ~/.ssh/id_rsa
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/id_rsa
    printf "\nHost *github.com\n\tIdentityFile ~/.ssh/id_rsa\n\tStrictHostKeyChecking no\n" >> ~/.ssh/config
    rm -rf .ssh/
fi
