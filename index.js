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

function getCommitHashStr (hash) {
	const { gitTrackerUrl } = program;
	const hashTrunc = hash.substring(0, HASH_VISIBLE_LENGTH);

	if (gitTrackerUrl) {
		return `[${hashTrunc}](${gitTrackerUrl.replace('{{hash}}', hash)})`;
	}
	else {
		return hashTrunc;
	}
}

function getTicketStr (ticket) {
	const { ticketTrackerUrl } = program;

	if (ticket) {
		if (ticketTrackerUrl) {
			return ` ([#${ticket}](${ticketTrackerUrl.replace('{{ticket}}', ticket)}))`;
		}
		else {
			return ` (#${ticket})`;
		}
	}

	return '';
}

function getTypeStr (type) {
	if (type) {
		return ` **${type}:**`;
	}

	return '';
}

const TICKET_ID_MATCH = /\(#([^\(]+)\)$/;
const TYPE_SCOPE_MATCH = /^([^(^:]+)(?:\(([^)]+)\))?:/;

function parseCommitBody (body) {
	const ticketMatch = body.match(TICKET_ID_MATCH);
	const ticket = ticketMatch.length > 1 ? ticketMatch[1] : null;

	const typeScopeMatch = body.match(TYPE_SCOPE_MATCH);
	const type = typeScopeMatch.length > 1 ? typeScopeMatch[1] : null;
	const scope = typeScopeMatch.length > 2 ? typeScopeMatch[2] : null;

	const subject = body
		.replace(TICKET_ID_MATCH, '')
		.replace(TYPE_SCOPE_MATCH, '')
		.trim();

	return {
		type, scope, subject, ticket
	};
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
			const { hash, type, authorName, authorEmail, date, subject, ticket } = commit;

			acc += `[${getCommitHashStr(hash)}]${getTypeStr(type)} ${subject}${getTicketStr(ticket)}  \n`;

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

	return execAsync(command).then((stdout, stderr) => {
		const commits = stdout
			.split('\n\n')
			.map((commit) => {
				const [ hash, authorName, authorEmail, date, body ] = commit.split('\n');

				return Object.assign(
					{ hash, authorName, authorEmail, date },
					parseCommitBody(body)
				);
			});

		return commits;
	});
}

function getVersionTags () {
	return execAsync(`cd ${program.path} && git tag`).then((stdout) => {
		const tags = stdout
			.split('\n')
			.filter((tag) => VERSION_TAG_CHECK.test(tag));

		return tags;
	});
}

getVersionTags().then((tags) => {
	const changelog = new Changelog();

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
