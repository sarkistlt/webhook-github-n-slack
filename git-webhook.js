const MY_SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/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';
let http = require('http'),
    createHandler = require('github-webhook-handler'),
    handler = createHandler({path: '/webhook', secret: '57e462a8cc5037315bb1e7c8'}),
    spawn = require('child_process').spawn,
    slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

    http.createServer(function (req, res) {
        handler(req, res, err => {
            res.statusCode = 404;
            res.end('no such location');
        });
    }).listen(5252);

handler.on('error', err => console.error(`Error: ${err.message}`));

handler.on('push', event => {
    let gitReset = spawn('git', ['reset', '--hard'], {cwd: '/var/www/vhosts/web4fly.com/httpdocs/dev/totalGID'});
    console.log('pushed');
    gitReset.on('exit', code => {
        let gitProcess = spawn('git', ['pull'], {cwd: '/var/www/vhosts/web4fly.com/httpdocs/dev/totalGID'});
        console.log('on exit');
        gitProcess.stdout.pipe(process.stdout);
        gitProcess.stderr.pipe(process.stderr);

        gitProcess.on('exit', code => {
            slack.send({
                channel: '#totalgid',
                text: 'totalGID.com, pointing at ' + event.payload.ref + ' has been updated',
                unfurl_links: 1,
                username: 'GIDBot',
                fields: {
                    'Commit': event.payload.head_commit.id,
                    'Message': event.payload.head_commit.message,
                    'Author': event.payload.head_commit.author.name
                }
            });
        });
    });
});