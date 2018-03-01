console.log('Start...');

const page = require('webpage').create(),
    system = require('system');

const prgStartAt = Date.now();

const resObj = {}, resIdList = [], overall = {};

var currentUrl = '';

if (system.args.length === 1 || !/^[a-zA-Z0-9_.-]+$/g.test(system.args[1])) {
    console.log('Invalid args. ');
    ending();
}

const pageUrls = function () {
    try {
        return require('./url/' + system.args[1] + '.json');
    } catch (e) {
        console.error('Invalid url config file.');
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

console.log(JSON.stringify(pageUrls, undefined, 4));

console.log('The default user agent is ' + page.settings.userAgent);

page.onResourceRequested = function (request) {
    // console.log('Request ' + JSON.stringify(request, undefined, 4));
    if (/(hiido|baidu).+\.gif/.test(request.url)) {
        return;
    }
    resObj[request.id] = {};
    resObj[request.id].startTime = new Date(request.time);
    resObj[request.id].url = request.url;
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
        if (resObj[response.id].overallDur > 200) { // 文件下载结束
            // console.log('Loading Overtime: ' + resObj[response.id].duration + 'ms ==== ' + response.url);
            console.log(JSON.stringify({
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
        console.log('Error: ' + JSON.stringify(response, undefined, 4));
        overall[currentUrl].resErr++;
        removeItemFromList(resIdList, response.id);
    }
};
page.onResourceTimeout = function (response) {
    if (resObj[response.id]) {
        console.log('Timeout Error: ' + JSON.stringify(response, undefined, 4));
        overall[currentUrl].resTO++;
        removeItemFromList(resIdList, response.id);
    }
};

var i = 0, isRunning = false;

const ts = setInterval(function () {
    if (isRunning || resIdList.length !== 0) {
        return;
    }
    if (pageUrls.urls.length <= i) {
        ending();
    }
    currentUrl = pageUrls.defaultProtocol + pageUrls.urls[i];
    const startTime = Date.now();
    isRunning = true;
    console.log('start to load "' + currentUrl + '"');
    page.open(currentUrl, function (status) {
        const nowTime = Date.now();
        const loadTime = nowTime - startTime;
        console.log('Status: ' + status);
        if (status === 'success') {
            // page.render('yycom.png');
            console.log('Page Loading time: ' + loadTime + 'ms.');
            overall[currentUrl].startAt = startTime;
            overall[currentUrl].endAt = nowTime;
            overall[currentUrl].loadTime = loadTime;
        } else {
            console.log('Fail to load "' + currentUrl + '"');
        }
        isRunning = false;
        i++;
    });
}, 2000);

function removeItemFromList(ls, item) {
    const index = ls.indexOf(item);
    if (index >= 0) {
        ls.splice(index, 1);
    }
}

function ending() {
    clearInterval(ts);
    if (overall) {
        console.log(JSON.stringify(overall, undefined, 4));
    }
    const prgEndAt = Date.now();
    console.log('Program starts at: ' + prgStartAt);
    console.log('Program ends at: ' + prgEndAt);
    console.log('Program takes: ' + (prgEndAt - prgStartAt));
    phantom.exit();
}