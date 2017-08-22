#!/usr/bin/env sh

SITE=stage.stephenlam.me

if [ -n "$1" ] && [ -n "$2" ]; then
    if [ -n "$3" ]; then
        echo "Deploying to ${2}/${3} as ${1}"
        rsync --delete -avH ./_site/ -e ssh ${1}@stephenlam.me:${2}/${3}
    else
        echo "Deploying to ${2}/${SITE} as ${1}"
        rsync --delete -avH ./_site/ -e ssh ${1}@stephenlam.me:${2}/${SITE}
    fi
else
    echo "Enter ssh user and site path."
fi


