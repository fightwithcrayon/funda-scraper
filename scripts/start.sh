#!/bin/bash

# Load gemeente naam
. /etc/gemeente

echo Scraper started: $(date)

if [ -d /root/Desktop/Funda ]; then
    echo "Removing old Funda directory ..."
    rm -rf /root/Desktop/Funda
fi

echo "Creating Funda directories ..."
mkdir -p /root/Desktop/Funda/Koop

for i in {1..5}
do
    echo "Download Funda page $i"
    /root/Desktop/savePages.sh "https://www.funda.nl/koop/1012xa/350000-450000/50+woonopp/2+kamers/+3km/p$i/" -b "firefox" -d "/root/Desktop/Funda/Koop/page$i.html"
    sleep 5s
done

echo "Finished downloading pages ..."
echo "------------------------------"
echo "Parsing downloaded pages ..."

nodejs /root/Desktop/parser.js
sleep 5s

echo "Parsing finished ..."
echo "------------------------------"
echo "Geocoding json files ..."

nodejs /root/Desktop/geocode.js
nodejs /root/Desktop/addMissingCoords.js
sleep 5s
VALID=$(nodejs /root/Desktop/validate.js)
sleep 5s

if [ "$VALID" == "true" ]; then
    echo "Geocoding finished ..."

    cp /root/Desktop/teKoop.json /home/meteorapp/build/bundle/programs/web.browser/app/data/teKoop.json
else
    echo "Some errors occured while geocoding ..."
    echo "Not saving results ..."
fi

echo "------------------------------"
echo "Cleaning up old files ..."

rm /root/Desktop/teKoop*.json

if [ -d /root/Desktop/Funda ]; then
    rm -rf /root/Desktop/Funda
fi

echo FINISHED: $(date)
