import {Command, flags} from '@oclif/command'

import * as fs from 'fs';
import * as ini from 'ini';
import * as shell from 'shelljs';
import * as path from 'path';
import kill from 'tree-kill';
import { startWebpack } from '../webpack';

const triliumUrl = 'https://github.com/zadam/trilium.git -b v0.50.2';
const config = ini.parse(fs.readFileSync(path.resolve(__dirname, '../../trilium-config.ini'), 'utf-8'));
const PORT = config.Network['port'];

function setup(dir: string) {
  if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
  }
  shell.exec(`git clone ${triliumUrl} ${dir}`);
  // install trilium deps
  shell.echo('Installing Trilium dependencies...');
  const currentDir = shell.pwd();
  shell.cd(dir);
  shell.exec('npm ci');
  shell.echo('Installing devtools dependencies...');
  shell.exec('npm i body-parser');
  shell.cd(currentDir);
  shell.echo('Done!');
}

export default class Start extends Command {
  static description = 'Installs and runs a trilium dev server with webpack hot reload'

  static examples = [
    `$ trilium-devtools start`,
  ]

  static flags = {
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: 'name to print'}),
    // flag with no value (-f, --force)
    force: flags.boolean({char: 'f'}),
  }

  static args = [{name: 'file'}]

  async run() {
    const {flags} = this.parse(Start)
    const triliumDir = './trilium';
    if (!fs.existsSync(triliumDir)) {
      shell.echo('First time start: Installing trilium server');
      setup(triliumDir);
    }
    console.log('Overriding Trilium config...');
    shell.cp(path.resolve(__dirname, '../../trilium-config.ini'), path.resolve(triliumDir, './config.ini'));
    shell.cp(path.resolve(__dirname, '../../scripts/Devtools.zip'), path.resolve(triliumDir, './db/Demo.zip'));
    const dataDir = path.resolve(triliumDir, 'localdata');

    console.log('Starting Trilium...');
    const serverProcess = shell.exec(`cd "${triliumDir}" && npx cross-env TRILIUM_PORT=${PORT} TRILIUM_DATA_DIR="${dataDir}" npm run start-server`, { 
      async: true
    });

    // Kill child process when this one dies
    // Prevent infinite sigterm loop
    let killed = false;
    const killServer = (...args: any) => {
      if (serverProcess?.pid && !killed) {
        killed = true;
        kill(serverProcess.pid)
      }
      console.log("\nExiting...", ...args)
      process.exit(args?.[1])
    }
    process.on('SIGINT', killServer);
    process.on('SIGTERM', killServer);
    process.on('uncaughtException', killServer);
    process.on('unhandledRejection', killServer);
    process.on('beforeExit', killServer);
    console.log('Starting webpack...');
    startWebpack();
  }
}
