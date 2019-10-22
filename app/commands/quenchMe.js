// Encode html characters when scraping google
// Parse possible @user and #channel search terms

const request = require('request');
const jimp = require('jimp');
const tinyColor = require("tinycolor2");
const cheerio = require('cheerio');
const snakeRespond = require('../utils/snakeRespond');
const colorThief = require('color-thief-jimp');
const randomWords = require('../utils/randomWords');

// Collection of error types
const TEXT_OVERFLOW = "TEXT_OVERFLOW";
const INVALID_IMAGE = "INVALID_IMAGE";
const FETCH_ISSUE = "FETCH_ISSUE";

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

function getAverageColor(originalImage) {
    let palette = colorThief.getPalette(originalImage)[0],
    averageColor = tinyColor({r: palette[0], g: palette[1], b: palette[2]});
    return { liquidColor: averageColor.toRgbString(), whiteText: averageColor.isDark() };

}

function splitText(text, fontLg, fontSm, maxTextWidth) {
    let re = /\s/gm,
    matches = [];

    while ((match = re.exec(text)) != null) {
        matches.push(match.index);
    }

    matches = matches.slice(0, Math.ceil(matches.length / 2));

    for (let i = matches.length - 1; i >= 0; i--) {
        let strLocation = matches[i],
        firstHalf = text.substring(0,strLocation).trim(),
        secondHalf = text.substring(strLocation).trim();

        if (jimp.measureText(fontLg, firstHalf) > maxTextWidth) {
            continue;
        }

        if (jimp.measureText(fontSm, secondHalf) > maxTextWidth) {
            continue;
        }
        return { error: null, firstHalf, secondHalf };
    }

    return { error: {errorType: TEXT_OVERFLOW} };
}

function createSoda(imageUrl, searchTerm) {
    return new Promise( async (resolve, reject) => {
        const FONT_BLACK_18 = await jimp.loadFont(process.env.IMAGE_DIR + 'font/font.fnt'),
        FONT_BLACK_14 =  await jimp.loadFont(process.env.IMAGE_DIR + 'font2/font.fnt'),
        FONT_WHITE_18 = await jimp.loadFont(process.env.IMAGE_DIR + 'fontW/font.fnt'),
        FONT_WHITE_14 =  await jimp.loadFont(process.env.IMAGE_DIR + 'fontW2/font.fnt'),
        catImage = await jimp.read(imageUrl),
        sodaBottle = await jimp.read(process.env.IMAGE_DIR + 'jones-soda-bottle.png'),
        sodaMask = sodaBottle.clone();
        sodaColorMask = sodaBottle.clone();
        imgWidth = sodaBottle.bitmap.width,
        imgHeight = sodaBottle.bitmap.height,
        label = new jimp(imgWidth/3, imgHeight, (error, img) => {
            if (error) { return reject({ errorType: INVALID_IMAGE, errorDetails: error }) }
            return img;
        });

        sodaBottle.crop(0,0,imgWidth/3, imgHeight);
        sodaMask.crop(imgWidth/3, 0, imgWidth/3, imgHeight);
        sodaColorMask.crop(imgWidth/1.5, 0, imgWidth/3, imgHeight);

        catImage.resize(220, 200);
        let colorPalette = getAverageColor(catImage);
        const sodaColor = new jimp(imgWidth/3, imgHeight, colorPalette.liquidColor, (error, img) => {
            if (error) { return reject({ errorType: INVALID_IMAGE, errorDetails: error }) }
            return img;
        });

        const random = Math.random();
        if (random > 0.8) {
            catImage.normalize();
        } else if (random > 0.6) {
            catImage.grayscale();
        } else if (random > 0.4) {
            let emboss = [[-2,-1,0],[-1,1,1],[0,1,2]];
            catImage.convolution(emboss);
        }

        label.composite(catImage, 225, 605);

        sodaColor.mask(sodaColorMask);

        label.mask(sodaMask);
        sodaBottle.composite(label, 0, 0);
        sodaBottle.composite(sodaColor, 0, 0, {
            mode: jimp.BLEND_OVERLAY,
            opacitySource: .7,
            opacityDestination: .9
        });

        // Hardcoded font info
        const maxTextWidth = 200,
            textXPos = 238,
            textYPos = 818;

        searchTerm = searchTerm.toUpperCase() + " SODA";

        const {error, firstHalf, secondHalf} = splitText(searchTerm, FONT_BLACK_18, FONT_BLACK_14, maxTextWidth);
        if (error) {
            return reject(error);
        }

        if (colorPalette.whiteText) {
            sodaBottle.print(FONT_WHITE_18, textXPos, textYPos, firstHalf, () => {
                sodaBottle.print(FONT_WHITE_14, textXPos, textYPos + 16, secondHalf);
            });
        } else {
            sodaBottle.print(FONT_BLACK_18, textXPos, textYPos, firstHalf, () => {
                sodaBottle.print(FONT_BLACK_14, textXPos, textYPos + 16, secondHalf);
            });
        }

        return sodaBottle.getBuffer(jimp.MIME_JPEG, (error, result) => {
            if (error) { return reject({ errorType: INVALID_IMAGE, errorDetails: error }) }
            return resolve(result);
        });
    });
}

function quenchMe(message, searchTerm, allowNSFW) {
    let isRandom;
    if (searchTerm) {
        searchTerm = searchTerm.trim();
    } else {
        searchTerm = randomWords(Math.floor(Math.random() * 4) + 1).join(' ');
        isRandom = true;
    }

    getSearchResults(searchTerm, allowNSFW)
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
            return snakeRespond(null, message, errorMessage);
        });
}

module.exports = quenchMe;