#!/bin/bash

echo Scraper started: $(date)

if [ -d /root/Desktop/Funda ]; then
    echo "Removing old Funda directory ..."
    rm -rf /root/Desktop/Funda
fi

echo "Creating Funda directories ..."
mkdir -p /root/Desktop/Funda/Koop

for i in {1..100}
do
    echo "Download Funda page $i"
    FILE="/root/Desktop/Funda/Koop/page$i.html"
    source /root/Desktop/savePages.sh "https://www.funda.nl/koop/1012xa/350000-450000/50+woonopp/2+kamers/+3km/p$i/" -b "firefox" -d "$FILE"
    wait
    if grep -q "Kies een groter gebied" "$FILE"; then
        break
    fi
    sleep 4s
done

echo "Finished downloading pages ..."
echo "------------------------------"
echo "Parsing downloaded pages ..."

nodejs /root/Desktop/parser.js
sleep 4s

echo "Parsing finished ..."
echo "------------------------------"
echo "Geocoding json files ..."

nodejs /root/Desktop/geocode.js
nodejs /root/Desktop/addMissingCoords.js
sleep 5s

echo "Geocoding finished ..."

if [ -d /root/Desktop/Funda ]; then
    rm -rf /root/Desktop/Funda
fi

echo FINISHED: $(date)
