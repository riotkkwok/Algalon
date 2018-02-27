console.log('Start...');

const page = require('webpage').create();

const pageUrls = require('./url/index.json');

const resObj = {}, overall = {};

var currentUrl = '';

console.log(JSON.stringify(pageUrls, undefined, 4));

console.log('The default user agent is ' + page.settings.userAgent);

page.onResourceRequested = function(request) {
    // console.log(page.url);
    // console.log('Request ' + JSON.stringify(request.id, undefined, 4));
    if(/(hiido|baidu).+\.gif/.test(request.url)){
        return;
    }
    resObj[request.id] = {};
    resObj[request.id].start = Date.now();
    resObj[request.id].url = request.url;
    if(!overall[currentUrl]){
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
};
page.onResourceReceived = function(response) {
    if(resObj[response.id] && response.stage === 'end'){
        resObj[response.id].end = Date.now();
        overall[currentUrl].resSuc++;
        resObj[response.id].duration = resObj[response.id].end - resObj[response.id].start;
        overall[currentUrl].avgDuration = ((overall[currentUrl].resSuc-1) * overall[currentUrl].avgDuration + resObj[response.id].duration) / overall[currentUrl].resSuc;
        if(resObj[response.id].duration > 200){
            // console.log('Loading Overtime: ' + resObj[response.id].duration + 'ms ==== ' + response.url);
            overall[currentUrl].resSlow++;
        }
    }
};
page.onResourceError = function(response) {
    console.log('Error: ' + JSON.stringify(response, undefined, 4));
    overall[currentUrl].resErr++;
};
page.onResourceTimeout = function(response) {
    console.log('Timeout Error: ' + JSON.stringify(response, undefined, 4));
    overall[currentUrl].resTO++;
};

var i = 0, isRunning = false, isWaiting = 0;

const ts = setInterval(function(){
    if(isRunning){
        return;
    }
    if(pageUrls.urls.length <= i){
        ending();
    }
    if(isWaiting > 0){
        isWaiting--;
        return;
    }
    currentUrl = pageUrls.defaultProtocol + pageUrls.urls[i];
    const startTime = Date.now();
    isRunning = true;
    console.log('start to load "'+currentUrl+'"');
    page.open(currentUrl, function(status) {
        console.log('Status: ' + status);
        if(status === 'success'){
            // page.render('yycom.png');
            console.log('Loading time: ' + (Date.now() - startTime) + 'ms.');
        }else{
            console.log('Fail to load "'+currentUrl+'"');
        }
        isRunning = false;
        isWaiting = 2;
        i++;
    });
}, 2000);

function ending(){
    clearInterval(ts);
    console.log(JSON.stringify(overall, undefined, 4));
    phantom.exit();
}