console.log('Start...');

const page = require('webpage').create(),
    system = require('system'),
    report = require('./report.js');

const prgStartAt = Date.now();

const resIdList = [], overall = {};

var resObj, currentUrl = '';

if (system.args.length === 1 || !/^[a-zA-Z0-9_.-]+$/g.test(system.args[1])) {
    report.put('Invalid args. ', 'E');
    ending();
}

const pageUrls = function () {
    try {
        report.setUrlName(system.args[1]);
        return require('./url/' + system.args[1] + '.json');
    } catch (e) {
        report.put('Invalid url config file.', 'E');
        ending();
    }
}();

phantom.onerror = function (msg, trace) {
    var msgStack = ['PHANTOM ERROR: ' + msg];
    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function (t) {
            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
        });
    }
    console.error(msgStack.join('\n'));
    ending();
};

report.put(JSON.stringify(pageUrls, undefined, 4), 'I');

report.put('The default user agent is ' + page.settings.userAgent);

page.viewportSize = {
    width: 1920,
    height: 1080
};

page.onResourceRequested = function (request) {
    // console.log('Request ' + JSON.stringify(request, undefined, 4));
    if (/(hiido|baidu).+\.gif/.test(request.url) || /^about:blank$/.test(request.url) || /^data:/.test(request.url)) {
        return;
    }
    resObj[request.id] = {};
    resObj[request.id].startTime = new Date(request.time);
    resObj[request.id].url = request.url;
    resObj.urls.push(request.url);
    if (!overall[currentUrl]) {
        overall[currentUrl] = {
            resTotal: 0,
            resSuc: 0,
            resSlow: 0,
            resErr: 0,
            resTO: 0,
            avgDuration: 0
        };
    }
    overall[currentUrl].resTotal++;
    resIdList.push(request.id);
};
page.onResourceReceived = function (response) {
    // console.log('Response ' + JSON.stringify(response, undefined, 4));
    if (resObj[response.id] && response.stage === 'start') { // 开始传输数据
        resObj[response.id].downloadTime = new Date(response.time);
        resObj[response.id].size = response.bodySize;
    } else if (resObj[response.id] && response.stage === 'end') {
        resObj[response.id].endTime = new Date(response.time);
        overall[currentUrl].resSuc++;
        resObj[response.id].overallDur = resObj[response.id].endTime - resObj[response.id].startTime;
        resObj[response.id].waitingDur = resObj[response.id].downloadTime - resObj[response.id].startTime;
        resObj[response.id].downloadDur = resObj[response.id].endTime - resObj[response.id].downloadTime;
        overall[currentUrl].avgDuration = ((overall[currentUrl].resSuc - 1) * overall[currentUrl].avgDuration + resObj[response.id].overallDur)
            / overall[currentUrl].resSuc;
        if (resObj[response.id].overallDur > 500) { // 文件下载结束
            // console.log('Loading Overtime: ' + resObj[response.id].duration + 'ms ==== ' + response.url);
            report.put(JSON.stringify({
                filePath: response.url,
                contentType: response.contentType,
                size: resObj[response.id].size,
                overallTime: resObj[response.id].overallDur,
                waitingTime: resObj[response.id].waitingDur,
                downloadTime: resObj[response.id].downloadDur
            }, undefined, 4));
            overall[currentUrl].resSlow++;
        }
        removeItemFromList(resIdList, response.id);
    }
};
page.onResourceError = function (response) {
    if (resObj[response.id]) {
        report.put('Error: ' + JSON.stringify(response, undefined, 4), 'E');
        overall[currentUrl].resErr++;
        removeItemFromList(resIdList, response.id);
    }
};
page.onResourceTimeout = function (response) {
    if (resObj[response.id]) {
        report.put('Timeout Error: ' + JSON.stringify(response, undefined, 4), 'E');
        overall[currentUrl].resTO++;
        removeItemFromList(resIdList, response.id);
    }
};

var i = 0, isRunning = false;

const ts = setInterval(function () {
    if (isRunning || resIdList.length !== 0) {
        return;
    }
    if (resObj) {
        report.put(JSON.stringify(resObj.urls, undefined, 4));
    }
    if (pageUrls.urls.length <= i) {
        ending();
    }
    currentUrl = pageUrls.defaultProtocol + pageUrls.urls[i];
    const startTime = Date.now();
    resObj = {
        urls: []
    };
    isRunning = true;
    report.put('start to load "' + currentUrl + '"');
    page.open(currentUrl, function (status) {
        const nowTime = Date.now();
        const loadTime = nowTime - startTime;
        report.put('Status: ' + status);
        if (status === 'success') {
            // page.render('yycom.png');
            report.put('Page Loading time: ' + loadTime + 'ms.');
            overall[currentUrl].startAt = startTime;
            overall[currentUrl].endAt = nowTime;
            overall[currentUrl].loadTime = loadTime;
        } else {
            report.put('Fail to load "' + currentUrl + '"', 'E');
        }
        isRunning = false;
        i++;
    });
    setTimeout(renderScreencap, 800);
}, 2000);

function removeItemFromList(ls, item) {
    const index = ls.indexOf(item);
    if (index >= 0) {
        ls.splice(index, 1);
    }
}

function renderScreencap() {
    const folder = currentUrl.replace(pageUrls.defaultProtocol, '').split('/')[0],
        file = currentUrl.replace(pageUrls.defaultProtocol + folder, '').replace(/\//g, '@') || '__';
    page.render('screen/' + folder + '/' + file + '.png');
}

function ending() {
    clearInterval(ts);
    if (overall) {
        report.put(JSON.stringify(overall, undefined, 4), 'I');
    }
    const prgEndAt = Date.now();
    report.put('Program starts at: ' + prgStartAt, 'I');
    report.put('Program ends at: ' + prgEndAt, 'I');
    report.put('Program takes: ' + (prgEndAt - prgStartAt), 'I');
    report.write();
    phantom.exit();
}