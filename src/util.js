function dateFormat(d) {
    return (d.getFullYear() + '-' + (d.getMonth() + 1) + '-' +  d.getDate() + '.' + d.getHours() + '-' + d.getMinutes() + '-' + d.getSeconds()).replace(/\b([0-9]{1})\b/g, '0$1').replace(/-/g, '').replace(/[.]/g, '_');
}

module.exports = {
    dateFormat: dateFormat
};