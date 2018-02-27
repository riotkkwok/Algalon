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
        // 禁用 console
        "no-console": 0,
        // 运算符 两侧要加空格
        "space-infix-ops": 1,
        // 禁止空语句块
        "no-empty": [1, { "allowEmptyCatch": true }],
        // 关键字 后面必须跟空格
        "keyword-spacing": [1, {"before": true, "after": true}],
        // 要求或禁止语句块之前的空格
        "space-before-blocks": [1, "always"],
        // 要求或禁止块内填充
        "padded-blocks": [1, {"blocks": "never"}], 
        // 一行代码最大长度
        "max-len": [1, {"code": 100, "ignoreStrings": true, "ignoreRegExpLiterals": true, "ignoreComments": true}],
        "no-trailing-spaces": [1, {"ignoreComments": true}],
    }
};