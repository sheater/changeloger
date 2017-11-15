const Commit = require('./Commit');

function matchItemAttribute (pattern, attr) {
	if (!pattern) {
		return true;
	}

	if (pattern instanceof RegExp) {
		return pattern.test(attr);
	}
	else {
		return pattern === attr;
	}
}

module.exports = class Version {
	constructor (numbers, options) {
		this._numbers = numbers;
		this._options = options;
		this._commits = [];
	}

	createCommit (data) {
		const commit = new Commit(data, this._options);
		this._commits.push(commit);

		return commit;
	}

	getVersionString () {
		return this._numbers.join('.');
	}

	_groupCommitsByType (commits) {
		const { groups } = this._options;

		return commits.reduce((acc, commit) => {
			const { type, scope, subject } = commit;

			const groupName = Object.keys(groups).find((groupName) => {
				const {
					type: typePattern,
					scope: scopePattern,
					subject: subjectPattern
				} = groups[groupName];

				return matchItemAttribute(typePattern, type) &&
					matchItemAttribute(scopePattern, scope) &&
					matchItemAttribute(subjectPattern, subject);
			});

			if (groupName) {
				if (acc.hasOwnProperty(groupName)) {
					acc[groupName].push(commit);
				}
				else {
					acc[groupName] = [ commit ];
				}
			}

			return acc;
		}, {});
	}

	_groupCommitsByScope (commits) {
		let unscopedCount = 0;

		return commits.reduce((acc, commit) => {
			const { scope } = commit;

			if (scope) {
				if (acc.has(scope)) {
					acc.get(scope).push(commit);
				}
				else {
					acc.set(scope, [ commit ]);
				}
			}
			else {
				acc.set(unscopedCount++, [ commit ]);
			}

			return acc;
		}, new Map());
	}

	_serializeScope (scope, commits) {
		let output = '';

		if (commits.length > 1) {
			output += `- **${scope}**:\n`;

			commits.forEach((commit) => {
				output += `  - ${commit.serialize()}\n`;
			});
		}
		else {
			const commit = commits[0];

			if (typeof scope === 'string') {
				output += `- **${scope}**: ${commit.serialize()}\n`;
			}
			else {
				output += `- ${commit.serialize()}\n`;
			}
		}

		return output;
	}

	_serializeType (type, commits) {
		const commitsByScope = this._groupCommitsByScope(commits);

		return [...commitsByScope.entries()].reduce((acc, [ scope, commits ]) => {
			return acc + this._serializeScope(scope, commits);
		}, `### ${type}  \n`);
	}

	_serializeDate () {
		const firstCommit = this._commits[0];

		return firstCommit.date.split(' ')[0];
	}

	serialize () {
		const commitsByType = this._groupCommitsByType(this._commits);

		return Object.keys(commitsByType).reduce((acc, type) => {
			return acc + this._serializeType(type, commitsByType[type]);
		}, `## ${this.getVersionString()} (${this._serializeDate()})  \n`);
	}
}
