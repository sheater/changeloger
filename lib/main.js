const fs = require('fs');
const $path = require('path');

const loadConfig = require('./loadConfig');
const Changelog = require('./Changelog');
const git = require('./git');
const { highlight } = require('./utils');
const config = require('./../config');

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

async function run (cmdOptions) {
	const startTime = new Date();

	// prefering absolute paths
	const path = cmdOptions.path || process.cwd();

	// merge default options with loaded config
	const loadedOptions = loadConfig($path.join(path, config.CONFIG_NAME));
	const options = Object.assign({}, defaultOptions, loadedOptions);

	// output from config can by replaced by command line argument
	options.output = cmdOptions.output || options.output;
	options.verbose = cmdOptions.verbose;

	console.log('Getting versions and commits...');

	const changelog = new Changelog(options);
	const lastVersionsCount = cmdOptions.all ? 0 : Number.parseInt(cmdOptions.num);
	const versions = await git.getVersions({
		path,
		lastVersionsCount,
	}, options);

	if (!versions.length) {
		console.log(highlight.error('There are no version tags.'));

		return;
	}

	const limit = (lastVersionsCount <= versions.length ? lastVersionsCount : null) || versions.length;

	for (let i = 0; i < limit; i++) {
		const [ toTag, ...versionNumbers ] = versions[i];
		const [ fromTag ] = versions[i + 1] ? versions[i + 1] : [ null ];

		const version = changelog.createVersion(versionNumbers);
		const commits = await git.getCommits({ path, fromTag, toTag }, options);

		commits.forEach((data) => version.createCommit(data));
	}

	console.log('Serializing...');

	const data = changelog.serialize();

	fs.writeFileSync(options.output, data);

	console.log(highlight.success(
		`Changelog successfully written to "${options.output}" after ${new Date() - startTime} ms.`
	));
}

module.exports = async function main (cmdOptions) {
	try {
		await run(cmdOptions);
	}
	catch (error) {
		console.log(highlight.error('main() error'), error);
	}
}
