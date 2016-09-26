export default function webhook(config) {
    let http = require('http'),
        createHandler = require('github-webhook-handler'),
        handler = config.github ? createHandler({path: config.github.path, secret: config.github.secret}) : false,
        spawn = require('child_process').spawn,
        slack = config.slack ? require('slack-notify')(config.slack.url) : false;

    http.createServer((req, res) => {
        handler(req, res, err => {
            res.statusCode = 404;
            res.end('no such location');
        });
    }).listen(config.port);
    handler.on('error', err => console.error(`Error: ${err.message}`));

    let gitPull = (event) => {
        let gitReset = spawn('git', ['reset', '--hard'], {cwd: config.github.projectRoot});
        gitReset.on('exit', code => {
            let gitProcess = spawn('git', ['pull'], {cwd: config.github.projectRoot});
            console.log('on exit');
            gitProcess.stdout.pipe(process.stdout);
            gitProcess.stderr.pipe(process.stderr);
            if (event) {
                gitProcess.on('exit', code => {
                    slack.send({
                        channel: `#${config.slack.channel}`,
                        text: `${config.slack.projectName}, pointing at ${event.payload.ref} has been updated`,
                        unfurl_links: 1,
                        username: 'webhook',
                        fields: {
                            'Commit': event.payload.head_commit.id,
                            'Message': event.payload.head_commit.message,
                            'Author': event.payload.head_commit.author.name
                        }
                    });
                    if (config.hasOwnProperty('exec')) {
                        let exec = require('child_process').exec;
                        exec(config.exec,
                            function (error, stdout, stderr) {
                                console.log('stdout: ' + stdout);
                                console.log('stderr: ' + stderr);
                                if (error !== null) {
                                    console.log('exec error: ' + error);
                                }
                            });
                    }
                });
            } else {
                gitProcess.on('exit', code => {
                    slack.send({
                        channel: `#${config.slack.channel}`,
                        text: `${config.slack.projectName}, scheduled "git pull"`,
                        unfurl_links: 1,
                        username: 'webhook'
                    });
                    if (config.hasOwnProperty('exec')) {
                        let exec = require('child_process').exec;
                        exec(config.exec,
                            function (error, stdout, stderr) {
                                console.log('stdout: ' + stdout);
                                console.log('stderr: ' + stderr);
                                if (error !== null) {
                                    console.log('exec error: ' + error);
                                }
                            });
                    }
                });
            }
        });
    };

    handler.on('push', event => gitPull(event));
    if (
        config.hasOwnProperty('schedule') &&
        Number.isInteger(config.schedule[0]) &&
        config.schedule[1].split(':').length === 2 &&
        config.schedule[1].split(':')[0].length === 2 &&
        config.schedule[1].split(':')[1].length === 2
    ) {
        let now = new Date(),
            tillFirstStart = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    config.schedule[1].split(':')[0],
                    config.schedule[1].split(':')[1]
                ) - now,
            eachDays = config.schedule[0] * 86400000;
        if (tillFirstStart <= 0) {
            tillFirstStart = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() + 1,
                    config.schedule[1].split(':')[0],
                    config.schedule[1].split(':')[1]
                ) - now;
        }
        setTimeout(() => setInterval(gitPull, eachDays), tillFirstStart);
    }
}