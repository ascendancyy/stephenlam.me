#!/usr/bin/env sh

JENV=development

if [ "$TRAVIS_BRANCH" = "master" ]; then
    JENV=production
fi

JEKYLL_ENV=$JENV bundle exec jekyll build
bundle exec htmlproofer ./_site --empty-alt-ignore true --disable-external --check-html --check-opengraph --check-img-http --report-missing-names --allow-hash-href
