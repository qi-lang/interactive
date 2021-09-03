/*
 * Copyright Qi Lang. 2021 All Rights Reserved.
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import Fs from 'fs';
import Os from 'os';
import * as Terminal from 'terminal-kit';

const logger = Fs.createWriteStream(`${Os.homedir()}/qi.log`, {
  flags: 'a',
});

function prompt(history: Array<string>) {
  Terminal.terminal('>>>');
  Terminal.terminal.inputField({ history }, (err, input) => {
    if (err) prompt(history);
    else if (input === '') {
      Terminal.terminal('\n');
      prompt(history);
    } else if (input !== '@e') {
      Terminal.terminal(`\n${input}\n`);
      history.push(input as string);
      logger.write(`${input}\n`);
      prompt(history);
    } else {
      Terminal.terminal('\nBye, bye!\n');
      process.exit(0);
    }
  });
}

Fs.readFile(`${Os.homedir()}/qi.log`, (err, data) => {
  if (err) {
    Terminal.terminal(`Could not open file ${Os.homedir()}qi.log: ${err}`);
    const history : string[] = [];
    prompt(history);
  } else {
    const history = data.toString().split(Os.EOL);
    history.pop();
    prompt(history);
  }
});
