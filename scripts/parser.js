"use strict";

const cheerio = require('cheerio');
const fs = require('fs');

const fundaKoopDir = process.env.NODE_ENV === 'development' ? './test/' : '/root/Desktop/Funda/Koop/';
const outputTeKoop = process.env.NODE_ENV === 'development' ? './testOutput.json' : '/root/Desktop/teKoop.json';

// Search for all files in Koop and Huur
const filesFundaTeKoop = fs.readdirSync(fundaKoopDir);

// Filter all files that end with .html
const htmlTeKoop = filesFundaTeKoop.filter(file => file.endsWith('.html')).map(file => fundaKoopDir + file);


// Build the GeoJson output file
buildOutputFile('Te Koop', outputTeKoop, htmlTeKoop);

/**
 * Parses all html files from the input and turns them into GeoJson
 * @param {string} title The title of output
 * @param {string} outputFile The output file location
 * @param {array} htmlPages The html files to be parsed
 */
function buildOutputFile(title, outputFile, htmlPages) {
    const features = parseFundaPages(htmlPages);

    // Create valid GeoJson from the found features and write it to the specified output file
    const json = JSON.stringify({
        'type': 'FeatureCollection',
        'crs': {
            'type': 'name',
            'properties': {
                'name': 'urn:ogc:def:crs:EPSG:28992'
            }
        },
        'properties': {
            'title': title,
            'updated': new Date()
        },
        'features': features
    });
    fs.writeFileSync(outputFile, json);

    console.log('Build finished ...');
}

/**
 * Parse the funda pages and return them as a feature array
 * @param {array} htmlPages The html pages to parse
 */
function parseFundaPages(htmlPages) {
    const features = htmlPages.reduce((total, page) => {
        console.log(`Parsing file: ${page}`);
        const data = fs.readFileSync(page, 'utf8');
        const $ = cheerio.load(data);
        const results = $('.search-result-content-inner').toArray().map((parent) => {
            const address = $('.search-result__header-title', parent).text();
            const numberIndex = address.search(/\d/);
            const street = address.slice(0, numberIndex);
            const number = address.slice(numberIndex);

            const subtitle = $('.search-result__header-subtitle', parent).text().trim().split(' ');
            const postcode = `${subtitle[0]}${subtitle[1]}`;
            const city = `${subtitle[2]}`;

            const price = $('.search-result-price', parent).text().replace('€ ', '').replace(' k.k.', '')
            const details = $('.search-result-kenmerken li', parent).toArray().map((el, i) => el.children[0].nodeValue);
            const size = $('.search-result-kenmerken span', parent).text().replace(' m²', '');
            const rooms = $('.search-result-kenmerken li:nth-child(2)', parent).text();

            return {
                'type': 'Feature',
                'properties': {
                    'Straat': street.trim(),
                    'Nummer': number.trim(),
                    'Plaats': city.trim(),
                    'Postcode': postcode.trim(),
                    'Price': price.trim().replace('.', ''),
                    'Agent': $('.search-result-makelaar-name', parent).text().trim(),
                    'URL': $('.search-result__header-title-col a:first-child', parent).attr('href').trim(),
                    'Size': size.trim(),
                    'Rooms': rooms.trim(),
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': []
                }
            }
        });
        return [...total, ...results];
    }, []);
    return features;
}
