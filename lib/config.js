const fs = require('fs');
const Ajv = require('ajv');

const { highlight } = require('./utils');

const ajv = new Ajv({
	allErrors: true,
	verbose: true,
});

require('ajv-keywords')(ajv, 'instanceof');

const schema = {
	type: 'object',
	additionalProperties: false,

	properties: {
		typeMatchPattern: { instanceof: 'RegExp' },
		ticketMatchPattern: { instanceof: 'RegExp' },
		cvsTrackerUrl: { type: 'string', format: 'url' },
		ticketTrackerUrl: { type: 'string', format: 'url' },
		hashVisibleLength: { type: 'number', minimum: 0 },

		groups: {
			type: 'object',

			additionalProperties: {
				type: 'object',

				properties: {
					type: {
						oneOf: [
							{ type: 'string' },
							{ instaceof: 'RegExp', not: { type: 'string' } }
						]
					},

					scope: {
						oneOf: [
							{ type: 'string', },
							{ instaceof: 'RegExp', not: { type: 'string' } }
						]
					},

					subject: {
						oneOf: [
							{ type: 'string' },
							{ instaceof: 'RegExp', not: { type: 'string' } }
						]
					}
				}
			}
		},
		output: { type: 'string' }
	},
};

function loadConfig (filepath) {
	if (!fs.existsSync(filepath)) {
		console.log(highlight.warning('No `changelog.config.js` found, using default'));

		return {};
	}

	const data = require(filepath);
	const valid = ajv.validate(schema, data);

	if (!valid) {
		console.log(highlight.error('Ajv errors'), ajv.errors);

		throw new Error('Invalid config');
	}

	return data;
}

const defaultConfig = [
	'const config = {',
	'  ticketMatchPattern: /\\(?#?(\\w+-\\d+)\\)?/,',
	'  hashVisibleLength: 6,',
	'  groups: {',
	`    'Chore': { type: 'chore' },`,
	`    'Documentation': { type: 'docs' },`,
	`    'New features': { type: 'feat' },`,
	`    'Bug fixes': { type: 'fix' },`,
	`    'Refactoring': { type: 'refactor' }`,
	`    'Style': { type: 'style' }`,
	`    'Test': { type: 'test' }`,
	`    'Dependencies': { type: 'dep' },`,
	'  }',
	'};',
	'',
	'module.exports = config;',
	''
].join('\n');

function generateDefaultConfig (filepath) {
	if (fs.existsSync(filepath)) {
		console.log(highlight.error(`"${filepath}" already exists`));
	
		return;
	}

	fs.writeFileSync(filepath, defaultConfig);

	console.log(highlight.success(`"${filepath}" successfully created`));
}

module.exports = { loadConfig, generateDefaultConfig };
