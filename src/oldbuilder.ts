/*
 * Copyright Qi Lang. 2021 All Rights Reserved.
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import Os from 'os';
import Terminal from 'terminal-kit';
import Fs from 'fs';

interface IBuilderOptions {
    path?: string
}

class Builder {
    private readonly path: Fs.PathLike;

    private readonly logger: Fs.WriteStream;

    constructor(options: IBuilderOptions) {
      this.path = typeof options.path === 'undefined'
        ? `${Os.homedir()}/.qi/history.log`
        : options.path;

      this.logger = Fs.createWriteStream(this.path, { flags: 'a' });
    }

    public prompt(history: Array<string>, counter: number = 0) {
      Terminal.terminal.bold(`iqi(${counter})>`);
      Terminal.terminal.inputField({ history }, (err, input) => {
        if (err) {
          this.prompt(history);
          return;
        }

        if (input === '') {
          Terminal.terminal('\n');
          this.prompt(history, counter);
          return;
        }

        if (input !== '@e') {
          Terminal.terminal(`\n${input}\n`);
          history.push(input as string);
          this.logger.write(`${input}\n`);
          this.prompt(history, counter + 1);
          return;
        }

        Terminal.terminal('\nBye, bye!\n');
        process.exit(0);
      });
    }

    public run() {
      Terminal.terminal(`${this.path}\n`);

      Fs.readFile(this.path, (err, data) => {
        if (err) {
          Fs.writeFile(this.path, '', (e) => {
            if (e) {
              Terminal.terminal(`Could not create file ${this.path}: ${e}\n`);
              Terminal.terminal.green('Using temporary history.');
            }
          });

          const history : Array<string> = [];
          this.prompt(history);
          return;
        }

        const history = data.toString().split(Os.EOL);
        history.pop();
        this.prompt(history);
      });
    }
}

new Builder({
  path: `${Os.homedir()}/.qi/history.log`,
}).run();
