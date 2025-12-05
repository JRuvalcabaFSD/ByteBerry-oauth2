#!/bin/sh
# update-version.sh - Updates package.json version silently

if [ -n "$BUILD_VERSION" ]; then
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.version = process.env.BUILD_VERSION;
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    " || exit 1
fi
