#!/usr/bin/env node

const program = require('commander');
const $path = require('path');

const { loadConfig, generateDefaultConfig } = require('./lib/config');
const generateChangelog = require('./lib/generate');
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

program
	.version('0.0.2')
	.description('changelog generation from git repository');

program
	.command('init')
	.description('create changelog.config.js file')
	.action(() => {
		generateDefaultConfig($path.join(process.cwd(), CONFIG_NAME));
	});

program
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

program
	.command('*', { isDefault: true })
	.action((arg) => {
		console.log(`Unknown command "${arg}"`);
		program.outputHelp();
	});

program.parse(process.argv);
