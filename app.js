const exec = require('child_process').exec;

const urlConfig = process.argv[2],
    mode = (process.argv[3] && process.argv[3].replace(/^-/, '')) || '',
    period = process.argv[4];

if (!urlConfig || !/^[a-zA-Z0-9_.-]+$/g.test(urlConfig)) {
    console.error('Error: Invalid args.');
}

const pageUrls = require('./src/url/' + urlConfig + '.json'),
    cmd = 'phantomjs ./src/run.js';

console.log(JSON.stringify(pageUrls, undefined, 4));

let i = -1, ts, taskRunning = false;

function main() {
    taskRunning = true;
    i++;
    if (pageUrls.urls.length <= i) {
        taskRunning = false;
        console.log('Task is finished.\r\n');
        return ;
    }
    const currentUrl = pageUrls.defaultProtocol + pageUrls.urls[i];
    console.log('============ ' + urlConfig + ' -- ' + currentUrl + ' ============');
    exec(cmd + ' ' + currentUrl + ' ' + urlConfig, function(err, stdout, stderr) {
        if (err) {
            console.error('Error: Failed to run phantomjs to access "' + currentUrl + '".');
            console.error(stderr);
        }
        console.log(stdout);
        main();
    });
}

if (mode === 't' && +period > 0) {
    console.log('Loop Task');
    ts = setInterval(function() {
        if (taskRunning) {
            console.error('Error: The last task is still running. Please have a check.');
            clearInterval(ts);
            return;
        }
        console.log('\r\n\r\n\r\nNew task is starting...\r\n');
        i = -1;
        main();
    }, period * 60 * 1000);
}

main();
