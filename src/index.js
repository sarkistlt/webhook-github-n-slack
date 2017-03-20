import Schedule from 'schedule-js';

export default function webhook(config) {
  const http = require('http');
  const createHandler = require('github-webhook-handler');
  const handler = config.github ? createHandler({ path: config.github.path, secret: config.github.secret }) : false;
  const spawn = require('child_process').spawn;
  const slack = config.slack ? require('slack-notify')(config.slack.url) : false;

  http.createServer((req, res) => {
    handler(req, res, (err) => {
      res.statusCode = 404;
      res.end('no such location');
    });
  }).listen(config.port);
  handler.on('error', err => console.error(`Error: ${err.message}`));

  const gitPull = (event) => {
    const gitReset = spawn('git', ['reset', '--hard'], { cwd: config.github.projectRoot });
    gitReset.on('exit', () => {
      const gitProcess = spawn('git', ['pull'], { cwd: config.github.projectRoot });
      console.log('git has reset');
      gitProcess.stdout.pipe(process.stdout);
      gitProcess.stderr.pipe(process.stderr);
      if (event) {
        gitProcess.on('exit', () => {
          console.log('git pulled');
          slack.send({
            channel: `#${config.slack.channel}`,
            text: `${config.slack.projectName}, pointing at ${event.payload.ref} has been updated`,
            unfurl_links: 1,
            username: 'webhook',
            fields: {
              Commit: event.payload.head_commit.id,
              Message: event.payload.head_commit.message,
              Author: event.payload.head_commit.author.name,
            },
          });
          if (config.hasOwnProperty('exec')) {
            const exec = require('child_process').exec;
            if (typeof (config.exec) === 'string') {
              exec(config.exec,
                (error, stdout, stderr) => {
                  console.log(`stdout: ${stdout}`);
                  console.log(`stderr: ${stderr}`);
                  if (error !== null) {
                    console.log(`exec error: ${error}`);
                  }
                });
            } else if (config.exec[0]) {
              let execCommand = '';
              config.exec.forEach((command, idx) => {
                if (idx === config.exec.length - 1) {
                  execCommand += command;
                } else {
                  execCommand += `${command} && `;
                }
              });
              exec(execCommand,
                (error, stdout, stderr) => {
                  console.log(`stdout: ${stdout}`);
                  console.log(`stderr: ${stderr}`);
                  if (error !== null) {
                    console.log(`exec error: ${error}`);
                  }
                });
            }
          }
        });
      } else {
        gitProcess.on('exit', () => {
          console.log('git pulled');
          slack.send({
            channel: `#${config.slack.channel}`,
            text: `${config.slack.projectName}, scheduled "git pull"`,
            unfurl_links: 1,
            username: 'webhook',
          });
          if (config.hasOwnProperty('exec')) {
            const exec = require('child_process').exec;
            if (typeof (config.exec) === 'string') {
              exec(config.exec,
                (error, stdout, stderr) => {
                  console.log(`stdout: ${stdout}`);
                  console.log(`stderr: ${stderr}`);
                  if (error !== null) {
                    console.log(`exec error: ${error}`);
                  }
                });
            } else if (config.exec[0]) {
              let execCommand = '';
              config.exec.forEach((command, idx) => {
                if (idx === config.exec.length - 1) {
                  execCommand += command;
                } else {
                  execCommand += `${command} && `;
                }
              });
              exec(execCommand,
                (error, stdout, stderr) => {
                  console.log(`stdout: ${stdout}`);
                  console.log(`stderr: ${stderr}`);
                  if (error !== null) {
                    console.log(`exec error: ${error}`);
                  }
                });
            }
          }
        });
      }
    });
  };

  handler.on('push', gitPull);
  if (config.hasOwnProperty('schedule')) {
    Schedule.scheduleAt(config.schedule[0], config.schedule[1], gitPull);
  }
}
