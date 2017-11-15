const fs = require('fs');
const program = require('commander');
const $path = require('path');

const loadConfig = require('./loadConfig');
const Changelog = require('./Changelog');
const git = require('./git');
const { highlight } = require('./utils');

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
	.version('0.0.1')
	.option('-a, --all', 'write all versions')
	.option('-n, --num <n>', 'number of last versions', 1)
	.option('-o, --output [file]', 'output file')
	.option('-p, --path [path]', 'input path')
	.option('-v, --verbose', 'verbose mode', false)
	.parse(process.argv);

async function run () {
	const startTime = new Date();

	// prefering absolute paths
	const path = program.path || process.cwd();

	// merge default options with loaded config
	const loadedOptions = loadConfig($path.join(path, 'changelog.config.js'));
	const options = Object.assign({}, defaultOptions, loadedOptions);

	// output from config can by replaced by command line argument
	options.output = program.output || options.output;
	options.verbose = program.verbose;

	console.log('Getting versions and commits...');

	const changelog = new Changelog(options);
	const lastVersionsCount = program.all ? 0 : Number.parseInt(program.num);
	const versions = await git.getVersions({
		path,
		lastVersionsCount,
	}, options);

	if (!versions.length) {
		console.log(highlight.error('There are no version tags.'));

		return;
	}

	const limit = lastVersionsCount || versions.length;

	for (let i = 0; i < limit; i++) {
		const [ toTag, ...versionNumbers ] = versions[i];
		const [ fromTag ] = versions[i + 1];

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

module.exports = async function main () {
	try {
		await run();
	}
	catch (error) {
		console.log(highlight.error('main() error'), error);
	}
}
