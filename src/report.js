const fs = require('fs');

var content = '', contentErr = '', name = '';

function setUrlName(n) {
    name = n;
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
            fs.write('./report/log/' + name + '__' + dateFormat(now) + '.log', content, 'w');
        }
        if (contentErr !== '' && contentErr.length > 0) {
            fs.write('./report/error/' + name + '__' + dateFormat(now) + '.log', contentErr, 'w');
        }
    } catch (e) {
        console.error(e);
    }
}

function dateFormat(d) {
    return (d.getFullYear() + '-' + (d.getMonth() + 1) + '-' +  d.getDate() + '_' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds()).replace(/\b([0-9]{1})\b/g, '0$1').replace(/-/g, '');
}

module.exports = {
    setUrlName: setUrlName,
    put: putStr,
    write: writeFile
};