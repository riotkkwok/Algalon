const fs = require('fs');

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
            fs.write('./report/log/' + config.name + '__' + dateFormat(now) + '.log', content, 'w');
        }
        if (contentErr !== '' && contentErr.length > 0) {
            contentErr = 'URL -- ' + config.url + '\r\n\r\n' + contentErr;
            fs.write('./report/error/' + config.name + '__' + dateFormat(now) + '.log', contentErr, 'w');
        }
    } catch (e) {
        console.error(e);
    }
}

function dateFormat(d) {
    return (d.getFullYear() + '-' + (d.getMonth() + 1) + '-' +  d.getDate() + '_' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds()).replace(/\b([0-9]{1})\b/g, '0$1').replace(/-/g, '');
}

module.exports = {
    setConfig: setConfig,
    put: putStr,
    write: writeFile
};