PACKAGE_NAME=$(node ./version)
VERSION=$(npm view $PACKAGE_NAME version || echo "")
if [[ -n $VERSION ]]; then echo "Couldn't publish over existing version."; exit 1; fi
