console.log('Start...');

const page = require('webpage').create(),
    system = require('system'),
    report = require('./report.js');

const prgStartAt = Date.now();

const resIdList = [], overall = {
    resTotal: 0,
    resSuc: 0,
    resSlow: 0,
    resErr: 0,
    resTO: 0,
    avgDuration: 0
};

var resObj = {
    urls: []
};

const currentUrl = system.args[1],
    urlName = system.args[2];

report.setUrlName(urlName);

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

report.put('The default user agent is ' + page.settings.userAgent);

page.viewportSize = {
    width: 1920,
    height: 1080
};

page.onResourceRequested = function (request) {
    if (/(hiido|baidu).+\.gif/.test(request.url) || /^about:blank$/.test(request.url) || /^data:/.test(request.url)) {
        return;
    }
    resObj[request.id] = {};
    resObj[request.id].startTime = new Date(request.time);
    resObj[request.id].url = request.url;
    resObj.urls.push(request.url);
    overall.resTotal++;
    resIdList.push(request.id);
};
page.onResourceReceived = function (response) {
    if (resObj[response.id] && response.stage === 'start') { // 开始传输数据
        resObj[response.id].downloadTime = new Date(response.time);
        resObj[response.id].size = response.bodySize;
    } else if (resObj[response.id] && response.stage === 'end') {
        resObj[response.id].endTime = new Date(response.time);
        overall.resSuc++;
        resObj[response.id].overallDur = resObj[response.id].endTime - resObj[response.id].startTime;
        resObj[response.id].waitingDur = resObj[response.id].downloadTime - resObj[response.id].startTime;
        resObj[response.id].downloadDur = resObj[response.id].endTime - resObj[response.id].downloadTime;
        overall.avgDuration = ((overall.resSuc - 1) * overall.avgDuration + resObj[response.id].overallDur)
            / overall.resSuc;
        if (resObj[response.id].overallDur > 500) { // 文件下载结束
            report.put(JSON.stringify({
                filePath: response.url,
                contentType: response.contentType,
                size: resObj[response.id].size,
                overallTime: resObj[response.id].overallDur,
                waitingTime: resObj[response.id].waitingDur,
                downloadTime: resObj[response.id].downloadDur
            }, undefined, 4));
            overall.resSlow++;
        }
        removeItemFromList(resIdList, response.id, 'end');
    }
};
page.onResourceError = function (response) {
    if (resObj[response.id]) {
        report.put('Error: ' + JSON.stringify(response, undefined, 4), 'E');
        overall.resErr++;
        removeItemFromList(resIdList, response.id, 'err');
    }
};
page.onResourceTimeout = function (response) {
    if (resObj[response.id]) {
        report.put('Timeout Error: ' + JSON.stringify(response, undefined, 4), 'E');
        overall.resTO++;
        removeItemFromList(resIdList, response.id, 'tout');
    }
};

var isRunning = true;
const startTime = Date.now();
report.put('start to load "' + currentUrl + '"');
page.open(currentUrl, function (status) {
    const nowTime = Date.now();
    const loadTime = nowTime - startTime;
    report.put('Status: ' + status);
    if (status === 'success') {
        report.put('Page Loading time: ' + loadTime + 'ms.');
        overall.startAt = startTime;
        overall.endAt = nowTime;
        overall.loadTime = loadTime;
    } else {
        report.put('Fail to load "' + currentUrl + '"', 'E');
    }
    isRunning = false;
});

const ts = setInterval(function () {
    if (isRunning || resIdList.length !== 0) {
        return;
    } else {
        if (resObj) {
            report.put(JSON.stringify(resObj.urls, undefined, 4));
        }
        resObj = null;
        renderScreencap();
        ending();
        return;
    }
}, 2000);

function removeItemFromList(ls, item, state) {
    const index = ls.indexOf(item);
    if (index >= 0) {
        ls.splice(index, 1);
    }
}

function renderScreencap() {
    const folder = currentUrl.replace(/^http(s)?:\/\//, '').split('/')[0],
        file = currentUrl.replace(new RegExp('^http(s)?://' + folder), '').replace(/\//g, '@') || '__';
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