#!/usr/bin/env node

const program = require('commander');

program
	.command('generate [options]', 'generate changelog', { isDefault: true })
	.command('init', 'create changelog.config.js file')
	.command('add', 'jeste nevim co')
	.version('0.0.1')
	.parse(process.argv);
