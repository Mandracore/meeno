#!/bin/bash -e 
# Testing the awk language

FILE="/opt/git/meeno/appSrv.js"
NOW="$(date +"%Y/%m/%d %T")"
sed -i "s|\(:::timestamp:::\)\(.*\)|\1 $NOW ',|g" $FILE
echo "Check new timestamp value (automate cache expiration):"
sed -n -e 's/^.*:::timestamp::: //p' $FILE