const { exec } = require('child_process');
const fs = require('fs');
const program = require('commander');

const HASH_VISIBLE_LENGTH = 10;

program
	.version('0.0.1')
	.option('-a, --all', 'Write all versions')
	.option('-n, --num <n>', 'Number of last versions', 1)
	.option('-o, --output [file]', 'Output file', 'CHANGELOG.md')
	.option('-p, --path [file]', 'Input path', '.')
	.option('--git-tracker-url [url]', 'Git tracker url')
	.option('--ticket-tracker-url [url]', 'Ticket tracker url')
	.parse(process.argv);

function getCommitHashStr (commit) {
	const { hash } = commit;
	const { gitTrackerUrl } = program;

	const hashTrunc = hash.substring(0, HASH_VISIBLE_LENGTH);

	if (gitTrackerUrl) {
		return `[${hashTrunc}](${gitTrackerUrl.replace('{{hash}}', hash)})`;
	}
	else {
		return hashTrunc;
	}
}

class Version {
	constructor (major, minor, patch) {
		this._major = major;
		this._minor = minor;
		this._patch = patch;
		this._commits = [];
	}

	addCommit (commit) {
		this._commits.push(commit);
	}

	serialize () {
		const header = `## ${this._major}.${this._minor}.${this._patch}\n`;

		return this._commits.reduce((acc, commit) => {
			const { authorName, authorEmail, date, subject } = commit;

			acc += `[${getCommitHashStr(commit)}] ${subject}  \n`;

			return acc;
		}, header);
	}
}

class Changelog {
	constructor () {
		this._versions = [];
	}

	addVersion (version) {
		this._versions.push(version);
	}

	write () {
		const content = this._versions.reduce((acc, version) => {
			acc += version.serialize();

			return acc;
		}, '# Changelog  \n');

		fs.writeFileSync(program.output, content);
		console.log('content', content);
	}
}

const STRIP_COMMIT = /,$/g;
const VERSION_TAG_CHECK = /^v\d+.\d+/;
const VERSION_MATCH = /^v(\d+).(\d+).?(\d+)?/;

function execAsync (command) {
	return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
				reject(error);

                return;
            }

            resolve(stdout, stderr);
        });
    });
}

function getTags () {
	return execAsync(`cd ${program.path} && git tag`)
		.then((stdout) => {
			const tags = stdout
				.split('\n')
				.filter((tag) => VERSION_TAG_CHECK.test(tag));

			return tags;
		});
}

function getCommits (fromTag, toTag) {
	let revision = `${toTag}`;

	if (fromTag && toTag) {
		revision = `${fromTag}..${toTag}`;
	}
	else if (toTag) {
		revision = toTag;
	}
	else if (fromTag) {
		revision = `${fromTag}..HEAD`;
	}

    const command = [
		`cd ${program.path} && git log --pretty=format:`,
			'%H%n', // hash
			'%aN%n', // author name
			'%aE%n', // author email
			'%ci%n', // date
			'%s%n', // subject
			` ${revision}`
	].join('');

	return execAsync(command)
		.then((stdout, stderr) => {
			const commits = stdout
				.split('\n\n')
				.map((commit) => {
					const [ hash, authorName, authorEmail, date, subject ] = commit.split('\n');

					return { hash, authorName, authorEmail, date, subject };
				});

			return commits;
		});
}

const changelog = new Changelog();

getTags().then((tags) => {
	const promises = tags.reverse().reduce((acc, tag, i) => {
		if (i >= program.num && !program.all) {
			return acc;
		}

		const versionMatch = tag.match(VERSION_MATCH);
		const [ , major, minor, patch ] = versionMatch;

		const version = new Version(major, minor, patch);

		changelog.addVersion(version);

		const fromTag = tags[i + 1];
		const promise = getCommits(fromTag, tag)
			.then((commits) => {
				commits.forEach((commit) => {
					version.addCommit(commit);
				});
			});

		acc.push(promise);

		return acc;
	}, []);

	Promise.all(promises).then(() => {
		changelog.write();

		console.log('done');
	});
});
