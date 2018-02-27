module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "phantomjs": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": 0,
        // 运算符 两侧要加空格
        "space-infix-ops": 1
    }
};