#!/usr/bin/env node

const commander = require('commander');
const $path = require('path');

const generateChangelog = require('./lib/generate');
const { loadConfig, generateDefaultConfig } = require('./lib/config');
const { CONFIG_NAME } = require('./config');

const defaultOptions = {
	versionMatchPattern: /^(\d+)\.(\d+)\.?(\d+)?/,
	typeMatchPattern: /^([^(^:]+)(?:\(([^)]+)\))?:/,
	ticketMatchPattern: /\(#([^\(]+)\)$/,
	hashVisibleLength: 10,
	cvsTrackerUrl: null,
	ticketTrackerUrl: null,
	groups: {},
	output: 'CHANGELOG.md',
};

commander
	.version('0.0.2')
	.description('changelog generation from git repository');

commander
	.command('init')
	.description('create changelog.config.js file')
	.action(() => {
		generateDefaultConfig($path.join(process.cwd(), CONFIG_NAME));
	});

commander
	.command('generate [options]')
	.description('generate changelog')
	.option('-a, --all', 'write all versions')
	.option('-n, --num <n>', 'number of last versions', 1)
	.option('-o, --output [file]', 'output file')
	.option('-p, --path [path]', 'input path')
	.option('-v, --verbose', 'verbose mode', false)
	.action((cmd, cmdOptions) => {
		// prefering absolute paths
		if (!cmdOptions.path) {
			cmdOptions.path = process.cwd();
		}

		// merge default options with loaded config
		const loadedOptions = loadConfig($path.join(cmdOptions.path, CONFIG_NAME));
		const options = Object.assign({}, defaultOptions, loadedOptions, cmdOptions);

		generateChangelog(options);
	});

commander
	.command('*')
	.action((arg) => {
		console.log(`Unknown command "${arg}"`);
		commander.outputHelp();
		process.exit(1);
	});

commander.parse(process.argv);

if (process.argv.length == 2) {
	commander.outputHelp();
	process.exit(1);
}
