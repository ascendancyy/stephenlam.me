#!/usr/bin/env sh

SITE=stage.stephenlam.me

if [ -n "$TRAVIS_BUILD_ID" ]; then
    if [ "$TRAVIS_BRANCH" = "master" ]; then
        SITE=stephenlam.me
    fi

    echo "Deploying to ${SITE}"
    rsync --delete -avH ${TRAVIS_BUILD_DIR}/dist/ -e ssh ${SSH_USER}@stephenlam.me:${DEPLOY_DIR}/${SITE}
else
    if [ -n "$1" ] &&  [ -n "$2" ]; then
        if [ -n "$3" ]; then
            echo "Deploying to ${2}/${3} as ${1}"
            rsync --delete -avH ./dist/ -e ssh ${1}@stephenlam.me:${2}/${3}
        else
            echo "Deploying to ${2}/${SITE} as ${1}"
            rsync --delete -avH ./dist/ -e ssh ${1}@stephenlam.me:${2}/${SITE}
        fi
    else
        echo "Enter ssh user and site path."
    fi
fi


