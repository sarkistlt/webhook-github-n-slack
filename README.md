## Small server to fast run webhook server for GitHub and/or Slack.

###How it works.
First:
~~~shell
npm i --save webhook-github-n-slack
~~~

```webhook``` function accept obj as argument with following structure:
~~~js
import webhook from 'webhook-github-n-slack';

let config = {
    github: {
        path: '/webhook', //payload URL (http:/domain.com:5254/webhook)
        secret: '**********',
        projectRoot: '/var/www/vhosts/domain.com/httpdocs' //local path to project
    },
    slack: {
        url: 'https://hooks.slack.com/services/******/******/***********', //slack webhook URL
        channel: 'development',
        projectName: 'name',
        exec: ['NODE_ENV=production webpack', 'npm run restart'] // pass any shell comand/s, it will run after function was execute by event or schedule 
    },
    port: 5254,
    schedule: ['1d', '18:00'] 
    //first argument 'interval' has to be string as following: ```'12345(ms || s || m || h || d)'```, second, 'time' has to be string as following: ```'23:30'```
};

...
/* your server */ 
...

webhook(config);
~~~

For scheduling we use [schedule-js](https://github.com/sarkistlt/schedule-js).

You can pass only Git, Slack or both configs together.
Else if you pass ```schedule``` property it will schedule auto run of function each specified days and at specified time, besides webhook, for example to keep project up-to-date and avoid any local changes in project. 


If you have any suggestion please leave me a message.
##### star to be up to date.
