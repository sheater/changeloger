const fs = require('fs');

const { highlight } = require('./lib/utils');
const { CONFIG_NAME } = require('./config');

const defaultConfig = [
	'const config = {',
	'  ticketMatchPattern: /\\(?#?(\\w+-\\d+)\\)?/,',
	'  hashVisibleLength: 6,',
	'  groups: {',
	`    'Dependencies': { type: 'dep' },`,
	`    'New features': { type: 'feat' },`,
	`    'Bug fixes': { type: 'fix' },`,
	`    'Refactoring': { type: 'refactor' }`,
	'  }',
	'};',
	'',
	'module.exports = config;',
	''
].join('\n');

if (fs.existsSync(CONFIG_NAME)) {
	console.log(highlight.error(`"${CONFIG_NAME}" already exists`));

	return;
}

fs.writeFileSync(CONFIG_NAME, defaultConfig);

console.log(highlight.success(`"${CONFIG_NAME}" successfully created`));
