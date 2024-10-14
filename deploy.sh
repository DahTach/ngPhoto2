#!/bin/bash

# Deploy WASM to GitHub Pages
# 1. Build the project
# 2. Copy the built files to the docs folder
# 3. Create a .nojekyll file in the docs folder
# 4. Create a _headers file in the docs folder
# 5. Create a _config.yml in the docs folder
# 6. Update the index.html <base href="/"> to <base href="/ngPhoto2/">
# 7. Commit and push the changes to the GitHub repository

# TODO: does --base-href "/ngPhoto2/" eliminate the need for the <base> tag in index.html?
echo "Deploying to GitHub Pages"
echo "Building the project"
ng build --prod
echo "Copying the built files to the docs folder"
cp -r dist/ngPhoto2/* docs
echo "Setting up the GitHub Pages configuration"
touch docs/.nojekyll
echo "/*.wasm
  Content-Type: application/wasm" >docs/_headers
echo "include: [_headers]" >docs/_config.yml
echo "Committing and pushing the changes to the GitHub repository"
git add .
git commit -m "Deploy to GitHub Pages"
git push
