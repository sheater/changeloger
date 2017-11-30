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
git commit -m $COMMIT_MESSAGE --allow-empty
git tag $VERSION
git push origin master
git push origin --tags

# # get highest tag number
# VERSION=`git describe --abbrev=0 --tags`

# # if no tag exists
# # if [ $? -ne 0 ]; then
# # 	VERSION="0.0.0"
# # fi

# # replace . with space so can split into an array
# VERSION_BITS=(${VERSION//./ })

# # get number parts and increase last one by 1
# VNUM1=${VERSION_BITS[0]}
# VNUM2=${VERSION_BITS[1]}
# VNUM3=${VERSION_BITS[2]}

# # decide which version bit will be increased
# if [ "$1" = "patch" ]; then
# 	VNUM3=$((VNUM3+1))
# elif [ "$1" = "minor" ]; then
# 	VNUM2=$((VNUM2+1))
# elif [ "$1" = "major" ]; then
# 	VNUM1=$((VNUM1+1))
# else
# 	echo "Use patch/minor/major parameter"
# 	exit
# fi

# # create new tag
# NEW_TAG="$VNUM1.$VNUM2.$VNUM3"

# echo "Updating $VERSION to $NEW_TAG"

# # get current hash and see if it already has a tag
# GIT_COMMIT=`git rev-parse HEAD`
# NEEDS_TAG=`git describe --contains $GIT_COMMIT`

# # only tag if no tag already (would be better if the git describe command above could have a silent option)
# if [ -z "$NEEDS_TAG" ]; then
#     echo "Tagged with $NEW_TAG (Ignoring fatal:cannot describe - this means commit is untagged) "
#     git tag -a $NEW_TAG -m 'release'
#     # git push --tags
# else
#     echo "Already a tag on this commit"
# fi
