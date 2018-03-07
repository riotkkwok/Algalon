const fs = require('fs'),
    util = require('./util.js');

var content = '', contentErr = '';

const config = {
    name: '',
    url: ''
};

function setConfig(opt) {
    config.name = opt.name;
    config.url = opt.url;
}

function putStr(str, mode) {
    if (mode === 'E') {
        console.error(str);
        contentErr += str;
        contentErr += '\r\n\r\n';
    } else {
        if (mode === 'I') {
            console.log(str);
        }
        content += str;
        content += '\r\n\r\n';
    }
}

function writeFile() {
    const now = new Date();
    try {
        if (content !== '' && content.length > 0) {
            fs.write('./report/log/' + config.name + '__' + util.dateFormat(now) + '.log', content, 'w');
        }
        if (contentErr !== '' && contentErr.length > 0) {
            contentErr = 'URL -- ' + config.url + '\r\n\r\n' + contentErr;
            fs.write('./report/error/' + config.name + '__' + util.dateFormat(now) + '.log', contentErr, 'w');
        }
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    setConfig: setConfig,
    put: putStr,
    write: writeFile
};