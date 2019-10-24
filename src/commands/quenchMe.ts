// Encode html characters when scraping google
// Parse possible @user and #channel search terms
// Handle gif edgecase

const request = require('request');
const Jimp = require('jimp');
import tinyColor = require("tinycolor2");
const cheerio = require('cheerio');
import snakeRespond from '../utils/snakeRespond';
//const colorThief = require('color-thief-Jimp');
import randomWords from '../utils/randomWords';

// Collection of error types
const TEXT_OVERFLOW = "TEXT_OVERFLOW";
const INVALID_IMAGE = "INVALID_IMAGE";
const FETCH_ISSUE = "FETCH_ISSUE";
const OTHER = "OTHER";

// Template items
let templateItemsLoaded = false,
    FONT_DARK,
    FONT_LIGHT,
    SODA_BOTTLE,
    SODA_MASK,
    SODA_COLOR_MASK;

// Hardcoded label info
const labelX = 225,
    labelY = 605,
    labelWidth = 220,
    labelHeight = 200;         

// Hardcoded font info
const maxTextWidth = 200,
    textXPos = 238,
    textYPos = 818;

function LoadTemplateItems(): Promise<any> {
    let path = process.cwd() + '/src/assets/'
    if (templateItemsLoaded) {
        return Promise.resolve();
    }
    return Promise.all([
        Jimp.loadFont(path + 'BEBAS_18_BLACK/BEBAS_18_BLACK.fnt'),
        Jimp.loadFont(path + 'BEBAS_14_BLACK/BEBAS_14_BLACK.fnt'),
        Jimp.loadFont(path + 'BEBAS_18_WHITE/BEBAS_18_WHITE.fnt'),
        Jimp.loadFont(path + 'BEBAS_14_WHITE/BEBAS_14_WHITE.fnt'),
        Jimp.read(path + 'jones-soda-bottle2.png')
    ]).then(items => {
        FONT_DARK = { LARGE: items[0], SMALL: items[1] };
        FONT_LIGHT = { LARGE: items[2], SMALL: items[3] };
        
        SODA_BOTTLE = items[4];
        SODA_MASK = SODA_BOTTLE.clone();
        SODA_COLOR_MASK = SODA_BOTTLE.clone();

        let imgWidth = SODA_BOTTLE.bitmap.width,
            imgHeight = SODA_BOTTLE.bitmap.height;

        SODA_BOTTLE.crop(0,0,imgWidth/3, imgHeight);
        SODA_MASK.crop(imgWidth/3, 0, imgWidth/3, imgHeight);
        SODA_COLOR_MASK.crop(imgWidth/1.5, 0, imgWidth/3, imgHeight);

        templateItemsLoaded = true;
    }).catch(error => {
        return { errorType: OTHER, errorDetails: error };
    });
}

function sendImage(message, body, searchTerm, allowNSFW) {
    let random = Math.random(),
    text = '';

    if (allowNSFW) {
        if (random > .95) {
            text = "You're going to hell before you die."
        } else if (random > .90) {
            text = "Every day we stray futher from god's light."
        } else if (random > .75) {
            text = "What the actual fuck?"
        } else if (random > .5) {
            text = "Jesus Christ why would you"
        } else if (random > .25) {
            text = "Please stop. Just, please stop."
        } else {
            text = "Just... just take it and go."
        }
    } else {
        if (random > .95) {
            text = 'I hope you choke on this.'
        } else if (random > .75) {
            text = "It'll quench you!"
        } else if (random > .5) {
            text = "Nothing's quenchier!"
        } else if (random > .25) {
            text = "It's the quenchiest!"
        } else {
            text = "Here you are!"
        }
    }

    message.channel.send("```"+text+"```", {
        files: [{
            attachment: body,
            name: `${allowNSFW ? 'SPOILER_' : ''}${searchTerm}.jpg`
        }]
    });
}

function getSearchResults(searchTerm, allowNSFW) {
    const url = `https://www.google.com/search?q=${searchTerm}&tbm=isch&tbs=isz:m${allowNSFW ? '' : '&safe=active'}`;
    searchTerm = searchTerm.replace(/\s/g, '+');
    const options = {
        url,
        method: 'get',
        encoding: null
    };
    return new Promise((resolve, reject) => {
        request(options, function(error, res, body) {
            if (error || !res || res.statusCode !== 200) {
                return reject({ errorType: FETCH_ISSUE, errorDetails: error });
            }
            return resolve(body.toString());
        });
    });
}

function scrapeRandomImgUrl(html) {
    return new Promise((resolve, reject) => {
        const imgArray = cheerio('img', html);
        if (imgArray.length === 0) {
            return reject("Hmm, sorry, couldn't find anything. Nothing that's SFW at least");
        }
        const random = Math.floor(Math.random() * imgArray.length);
        return resolve(imgArray[random].attribs.src);
    });
}

// TODO: colorThief is not giving adequete results, consider reverting to former method?
// function getAverageColor(originalImage) {
//     let palette = colorThief.getPalette(originalImage)[0],
//     averageColor = tinyColor({r: palette[0], g: palette[1], b: palette[2]}).saturate();
//     return { liquidColor: averageColor, whiteText: averageColor.isDark() };

// }

function getAverageColor(originalImage, resolution) {
    let count, avgR, avgG, avgB, img;
    count = avgR = avgG = avgB = 0;

    img = originalImage.clone()
    img.cover(resolution, resolution);

    img.scan(0,0,img.bitmap.width,img.bitmap.height, (x, y, idx) => {
        avgR += img.bitmap.data[idx + 0] * img.bitmap.data[idx + 0];
        avgG += img.bitmap.data[idx + 1] * img.bitmap.data[idx + 1];
        avgB += img.bitmap.data[idx + 2] * img.bitmap.data[idx + 2];
        count++;
    });

    avgR = Math.floor(Math.sqrt(avgR/count));
    avgG = Math.floor(Math.sqrt(avgG/count));
    avgB = Math.floor(Math.sqrt(avgB/count));

    let averageColor = tinyColor({r: avgR, g: avgG, b: avgB}).saturate(100);

    return { liquidColor: averageColor, whiteText: averageColor.isDark() };
}

function splitText(text, maxTextWidth) {
    let re = /\s/gm,
    matches = [],
    match;

    while ((match = re.exec(text)) != null) {
        matches.push(match.index);
    }

    matches = matches.slice(0, Math.ceil(matches.length / 2));

    for (let i = matches.length - 1; i >= 0; i--) {
        let strLocation = matches[i],
        firstHalf = text.substring(0,strLocation).trim(),
        secondHalf = text.substring(strLocation).trim();

        if (Jimp.measureText(FONT_DARK.LARGE, firstHalf) > maxTextWidth) {
            continue;
        }

        if (Jimp.measureText(FONT_DARK.SMALL, secondHalf) > maxTextWidth) {
            continue;
        }
        return { error: null, firstHalf, secondHalf };
    }

    return { error: {errorType: TEXT_OVERFLOW} };
}

function drawOverMask(mask, source: tinyColor, maskX, maskY, maskWidth, maskHeight): void;
function drawOverMask(mask, source: any, maskX, maskY, maskWidth, maskHeight): void {
    let color = source instanceof tinyColor ? { ...source.toRgb() } : undefined;
    
    mask.scan(maskX,maskY,maskWidth, maskHeight, (x, y) => {
        let sourceAlpha = Jimp.intToRGBA(mask.getPixelColor(x,y)).a;

        if (!(source instanceof tinyColor)) {
            color = { ...Jimp.intToRGBA(source.getPixelColor(x-maskX,y-maskY)) };
        }

        mask.setPixelColor( Jimp.rgbaToInt( color.r, color.g, color.b, sourceAlpha), x, y);
    })
}

function createSoda(imageUrl, searchTerm) {
    return new Promise( async (resolve, reject) => {
        const loadedImage = await Jimp.read(imageUrl);

        // Make clones of template items
        let sodaBottle = SODA_BOTTLE.clone(),
        sodaMask = SODA_MASK.clone(),
        sodaColorMask = SODA_COLOR_MASK.clone();

        const imgWidth = sodaBottle.bitmap.width,
        imgHeight = sodaBottle.bitmap.height;

        loadedImage.resize(labelWidth,labelHeight);
        let colorPalette = getAverageColor(loadedImage, 10);
         
        const random = Math.random();
        if (random > 0.8) {
            loadedImage.normalize();
        } else if (random > 0.6) {
            loadedImage.grayscale();
        } else if (random > 0.4) {
            let emboss = [[-2,-1,0],[-1,1,1],[0,1,2]];
            loadedImage.convolution(emboss);
        }

        drawOverMask(sodaMask, loadedImage, labelX, labelY, labelWidth, labelHeight);
        sodaBottle.composite(sodaMask,0,0);

        drawOverMask(sodaColorMask, colorPalette.liquidColor, 0, 0, imgWidth, imgHeight);
        sodaBottle.composite(sodaColorMask, 0, 0, {
            mode: Jimp.BLEND_OVERLAY,
            opacitySource: .7,
            opacityDest: .9
        });

        searchTerm = searchTerm.toUpperCase() + " SODA";

        const {error, firstHalf, secondHalf} = splitText(searchTerm, maxTextWidth);
        if (error) {
            return reject(error);
        }

        if (colorPalette.whiteText) {
            sodaBottle.print(FONT_LIGHT.LARGE, textXPos, textYPos, firstHalf, () => {
                sodaBottle.print(FONT_LIGHT.SMALL, textXPos, textYPos + 16, secondHalf);
            });
        } else {
            sodaBottle.print(FONT_DARK.LARGE, textXPos, textYPos, firstHalf, () => {
                sodaBottle.print(FONT_DARK.SMALL, textXPos, textYPos + 16, secondHalf);
            });
        }

        return sodaBottle.getBuffer(Jimp.MIME_JPEG, (error, result) => {
            if (error) { return reject({ errorType: INVALID_IMAGE, errorDetails: error }) }
            return resolve(result);
        });
    });
}

async function quenchMe(snakebot, message, searchTerm, allowNSFW) {
    let startTime = new Date().getTime();
    let isRandom;
    if (searchTerm) {
        searchTerm = searchTerm.trim();
    } else {
        searchTerm = randomWords(Math.floor(Math.random() * 4) + 1).join(' ');
        isRandom = true;
    }

    await LoadTemplateItems()
        .then(_ => getSearchResults(searchTerm, allowNSFW))
        .then(html => scrapeRandomImgUrl(html))
        .then(imgUrl => createSoda(imgUrl, searchTerm))
        .then(body => sendImage(message, body, searchTerm, allowNSFW))
        .catch(error => {
            let errorMessage = "Whoops, something went wrong there... try again later?";
            switch(error.errorType) {
                case TEXT_OVERFLOW:
                    if (isRandom) {
                        errorMessage = "Oops, I accidentally dropped it on my way back and it shattered into a mil- I mean, the name I picked was far too long. Yup, that's the issue. Honest";
                    } else {
                        errorMessage = "Hold on, that name is way too long. There's no way that's a real soda.";
                    }
                    break;
                case FETCH_ISSUE:
                    errorMessage = "Sorry, couldn't get one of the ingredients I needed. Blame Google probably.";
                    break;
                case INVALID_IMAGE:
                    errorMessage = "So, I tried mixing everything together, but something went bad. Give it a try again later?";
                    break;
            }
            console.log(error.detail ? error.details : error);
            return snakeRespond(snakebot, message, errorMessage);
        });
    let endTime = new Date().getTime();

    console.log(endTime - startTime);
}

export default quenchMe;