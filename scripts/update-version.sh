#!/bin/bash

set -ex

DEPLOY_RANK=${1:-patch}

if [[ ! $DEPLOY_RANK =~ ^(patch|minor|major)$ ]]; then
	echo `Wrong argument version "$DEPLOY_RANK"`
	exit 1
fi

VERSION=$(npm --no-git-tag-version version $DEPLOY_RANK)

COMMIT_MESSAGE="Release $VERSION"

echo $COMMIT_MESSAGE

git add .
git commit -m "$COMMIT_MESSAGE" --allow-empty
git tag $VERSION
git push origin master
git push origin --tags
