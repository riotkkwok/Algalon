# Algalon
网页（静态资源）请求监控

## Features
- 监控网页及其静态资源的加载状态，并记录log和error
- 设置定时循环执行（如需要）
- 通过邮件发送error日志（如需要）

## Pre-condition
1. 安装Nodejs 6.9.1版本以上
2. 安装Phantomjs并正确配置，安装和配置指南请查看[Phantomjs官网](http://phantomjs.org/quick-start.html)

## Tutorial

### Step 1:
安装项目依赖的node modules，在Algalon目录下的命令行下执行：

`npm install`

### Step 2:
在config/url下，新建json文件配置要监控的网页地址，例如配置index.json为以下内容：

    {
        "urls": [
            "www.google.com"
        ],
        "defaultProtocol": "https://"
    }

### Step 3:
如需要使用邮件功能，在config/mail下，新建mail.json文件配置邮箱信息。

    {
        "host": "smtp.abc.com",
        "user": "xxxxxx@abc.com",
        "pwd": "password",
        "mailTo": "zzzzzz@abc.com",
        "title": "[Algalon] Error Report for "
    }

其中，
host：邮箱提供商的smtp地址
user：发送人邮箱地址
pwd：发送人邮箱密码
mailTo：收件人邮箱地址
title：邮件主题前缀，程序会加上监控的url配置文件名、网页地址以及时间戳，方便辨识

### Step 4:
调用命令执行：

`node app.js [url_config_filename] -[mode] [interval]`

__url_config_filename__ 是对应Step 2设置的配置文件名
__mode__ 目前可选择一下任意或组合的模式
    - m, 开启邮件功能模式
    - t, 开启轮询模式
__interval__ 是处在轮询模式下，设置轮询的间隔时间，单位为分钟

#### 例子
`node app.js index -mt 15`
_监控config/url/index.json里面定义的URL，开启右键功能和轮询，每15分钟执行一次_

