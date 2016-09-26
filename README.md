## Small server to fast run webhook server for GitHub and/or Slack.

#### Full support of all graphQL "Definitions" and "Scalars" besides "GraphQLFloat", because in Mongoose schema you can use only int. numbers. But you can use ```props``` property to pass it, details below. 

This package will help you  avoid typing schemas for same essence.
If you already have Mongoose schema that's enough to generate graphQL schema.

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
        projectName: 'name'
    },
    port: 5254,
    schedule: [7, '18:00'] //first is Number, representing days, second is String, representing time
};

...
/* your server */ 
...

webhook(config);
~~~

You can pass only Git, Slack or both configs together.
Else if you pass ```schedule``` property it will schedule auto run of function each specified days and at specified time, besides webhook, for example to keep project up-to-date and avoid any local changes in project. 


If you have any suggestion please leave me a message.
##### star to be up to date.