const wordList = require('./words.json');

function getRandomWords(count) {
    let output = [];
    for (let i = 0; i < count; i++) {
        let r = Math.floor(Math.random() * wordList.length);
        output.push(wordList[r]);
    }
    return output;
}

module.exports = getRandomWords