/*
 * Copyright Qi Lang. 2021 All Rights Reserved.
 * This file is licensed under the MIT License.
 * License text available at https://opensource.org/licenses/MIT
 */

import * as Fs from 'fs';
import * as Os from 'os';
import * as Path from 'path';
import * as Terminal from 'terminal-kit';

interface IBuilderOptions {
  path: string
}

class Builder {
  public readonly parsedPath: Path.ParsedPath;

  public readonly evaluatedPath: string;

  constructor(options: IBuilderOptions) {
    this.parsedPath = Path.parse(options.path);
    this.evaluatedPath = this.parsedPath.dir + Path.sep + this.parsedPath.base;
  }

  public prepareHistory() {
    if (!(Fs.existsSync(Path.normalize(this.evaluatedPath)))) {
      Fs.mkdirSync(this.parsedPath.dir);
      Fs.writeFileSync(this.evaluatedPath, '', { flag: 'a' });
    }
  }

  public getHistory(): Buffer {
    this.prepareHistory();
    return Fs.readFileSync(this.evaluatedPath);
  }

  public pushLine(s: string) {
    const logger = Fs.createWriteStream(this.evaluatedPath, { flags: 'a' });
    logger.write(s);
  }

  public prompt(history: Array<string>) {
    Terminal.terminal.white('%>');

    Terminal.terminal.inputField({ history }, (err, input) => {
      if (err) {
        throw new Error(err);
      }

      if (input === '') {
        Terminal.terminal('\n');
        this.prompt(history);
        return;
      }

      if (input !== '!e') {
        Terminal.terminal(`\n${input}\n`);

        if (input != null) history.push(input);
        this.pushLine(`${input}\n`);

        this.prompt(history);
        return;
      }

      Terminal.terminal('\nBye, bye!\n');
      process.exit(0);
    });
  }

  public run() {
    Terminal.terminal.windowTitle('Interactive Qi');
    Terminal.terminal.clear();
    Terminal.terminal(`Interactive Qi (${undefined}) — using node ${process.version}\n`);
    Terminal.terminal.green(`Reading history from: ${this.evaluatedPath}\n`);

    this.prepareHistory();
    const history = this.getHistory().toString().split(Os.EOL);
    history.pop();

    this.prompt(history);
  }
}

new Builder({
  path: `${Os.homedir()}/.qi/history.log`,
}).run();
