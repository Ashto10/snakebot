const request = require('request');
const jimp = require('jimp');
const tinyColor = require("tinycolor2");
const cheerio = require('cheerio');
const snakeRespond = require('../utils/snakeRespond');

function sendImage(message, body, searchTerm) {
    let random = Math.random(),
    text = '';

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

    message.channel.send("```"+text+"```", {
        files: [{
            attachment: body,
            name: `${searchTerm}.jpg`
        }]
    });
}

function getSearchResults(searchTerm) {
    searchTerm = searchTerm.replace(/\s/g, '+');
    const options = {
        url: `https://www.google.com/search?q=${searchTerm}&tbm=isch&tbs=isz:m`,
        method: 'get',
        encoding: null
    };
    return new Promise((resolve, reject) => {
        request(options, function(err, res, body) {
            if (err) {
                return reject(err);
            }
            return resolve(body.toString());
        });
    });
}

function scrapeRandomImgUrl(html) {
    const imgArray = cheerio('img', html);
    const random = Math.floor(Math.random() * imgArray.length);
    return imgArray[random].attribs.src;
}

function getAverageColor(originalImage, resolution) {
    let count, avgR, avgG, avgB;
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
        return { firstHalf, secondHalf };
    }

    return { err: "WHOA, that's way too long of a name. There's no way that's a real soda." };
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
        label = new jimp(imgWidth/3, imgHeight, (err, img) => {
            if (err) { return console.log(err) }
            return img;
        });

        sodaBottle.crop(0,0,imgWidth/3, imgHeight);
        sodaMask.crop(imgWidth/3, 0, imgWidth/3, imgHeight);
        sodaColorMask.crop(imgWidth/1.5, 0, imgWidth/3, imgHeight);

        catImage.resize(220, 200);
        let colorPalette = getAverageColor(catImage, 20);
        const sodaColor = new jimp(imgWidth/3, imgHeight, colorPalette.liquidColor, (err, img) => {
            if (err) { return console.log(err) }
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

        const {err, firstHalf, secondHalf} = splitText(searchTerm, FONT_BLACK_18, FONT_BLACK_14, maxTextWidth);
        if (err) {
            return reject(err);
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

        return sodaBottle.getBuffer(jimp.MIME_JPEG, (err, result) => {
            if (err) { return reject(err) }
            return resolve(result);
        });
    });
}

function quenchMe(message, searchTerm) {
    searchTerm = searchTerm.trim();
    getSearchResults(searchTerm)
        .then(html => scrapeRandomImgUrl(html))
        .then(imgUrl => createSoda(imgUrl, searchTerm))
        .then(body => sendImage(message, body, searchTerm))
        .catch(err => {
            return snakeRespond(null, message, err);
        });
}

module.exports = quenchMe;