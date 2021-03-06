"use strict"

const fs = require('fs');

const locationTeKoop = '/root/Desktop/teKoop.json';

addMissingCoords(locationTeKoop);

function addMissingCoords(fileLocation) {
    const inputFile = fs.readFileSync(fileLocation, 'utf8');
    const json = JSON.parse(inputFile);
    const features = json['features'];

    for (const feature of features) {
        const geometry = feature['geometry'];
        const coords = geometry['coordinates'];

        if (coords.length === 0) {
            feature['geometry']['coordinates'] = [0, 0];
        }
    }

    fs.writeFileSync(fileLocation, JSON.stringify(json));
}
