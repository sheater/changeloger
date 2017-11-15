const { execAsync, highlight } = require('./utils');
const Version = require('./Version');
const Commit = require('./Commit');

function compareVersions (a, b) {
	const length = Math.min(a.length, b.length);

	for (let i = 1; i < length; i++) {
		if (a[i] > b[i]) {
			return -1;
		}
		else if (a[i] < b[i]) {
			return 1;
		}
	}

	return 0;
}

async function getVersions ({ path, lastVersionsCount }, options) {
	const { stdout } = await execAsync(`cd ${path} && git tag`);
	const { versionMatchPattern } = options;

	const tags = stdout
		.split('\n')
		.filter((tag) => versionMatchPattern.test(tag))
		.map((tag) => {
			const [ match, ...rest ] = tag.match(versionMatchPattern);

			return [ match, ...rest.map((value) => Number.parseInt(value, 10)) ];
		})
		.sort(compareVersions);

	if (lastVersionsCount) {
		return tags.slice(0, lastVersionsCount + 1);
	}
	else {
		return tags;
	}
}

async function getCommits ({ path, fromTag, toTag }) {
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

	console.log('revision', revision);

    const command = [
		`cd ${path} && git log --pretty=format:`,
			'%H%n', // hash
			'%aN%n', // author name
			'%aE%n', // author email
			'%ci%n', // date
			'%s%n', // subject
			` ${revision}`
	].join('');

	const { stdout } = await execAsync(command);

	const commits = stdout
		.split('\n\n')
		.map((commit) => {
			const [ hash, authorName, authorEmail, date, body ] = commit.split('\n');

			// return new Commit({ hash, authorName, authorEmail, date, body });
			return { hash, authorName, authorEmail, date, body };
		});

	return commits;
}

module.exports = { getVersions, getCommits };
