#!/bin/bash -e 
# Testing the awk language

FILE="/opt/git/meeno/appSrv.js"
NOW="$(date +"%Y/%m/%d %T")"
echo $NOW
sed -i "s|\(:::timestamp:::\)\(.*\)|\1 $NOW ',|g" $FILE
