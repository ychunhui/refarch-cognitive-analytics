#!/bin/bash
# Program to modify the version number for the different element and compile

# Get default version if the version is not the first argument
prev=$(grep -o 'v\([0-9]\+.\)\{2\}\([0-9]\+\)' src/client/app/app.component.ts)

if [[ $# -gt 0 ]]; then
	v=v$1
else
  v=$prev
fi
echo $v

cd src

# Update client version
sed -i '' -e s/$prev/$v/g client/app/app.component.ts

# Update server version
sed -i '' -e s/$prev/$v/g server/config/config.json

# Compile Angular
ng build
# Build docker
docker build -t ibmcase/greenapp .
docker tag ibmcase/greenapp greencluster.icp:8500/greencompute/greenapp:$v

docker images
## modify helm version
cd ../chart/green-customerapp
a=$(grep 'version' Chart.yaml)
sed -i -e 's/"$a"/version: "$v"/g' Chart.yaml
## same for the tag in values.yaml
