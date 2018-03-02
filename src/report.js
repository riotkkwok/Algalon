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
    const now = Date.now();
    try {
        if (content !== '' && content.length > 0) {
            content.replace();
            fs.write('./report/log/' + name + '_' + now + '.log', content);
        }
        if (contentErr !== '' && contentErr.length > 0) {
            fs.write('./report/error/' + name + '_' + now + '.log', contentErr);
        }
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    setUrlName: setUrlName,
    put: putStr,
    write: writeFile
};