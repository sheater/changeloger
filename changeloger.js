#!/usr/bin/env node

const program = require('commander');

program
	.command('generate [options]', 'generate changelog', { isDefault: true })
	.command('init', 'create changelog.config.js file')
	.version('0.0.1')
	.parse(process.argv);
