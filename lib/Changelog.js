const Version = require('./Version');
const git = require('./git');
const { highlight } = require('./utils');

module.exports = class Changelog {
	constructor (options) {
		this._versions = [];
		this._options = options;
	}

	async generate () {
		await this._processVersions();
		return this._serialize();
	}

	_createVersion (numbers) {
		const version = new Version(numbers, this._options);
		this._versions.push(version);

		return version;
	}

	_serialize () {
		console.log('Serializing...');

		if (!this._versions.length) {
			throw new Error('No versions for serialization');
		}

		return this._versions.reduce((acc, version) => {
			acc += version.serialize();

			return acc;
		}, '# Changelog  \n');
	}

	async _processVersions () {
		console.log('Getting versions and commits...');

		const { path, num, all } = this._options;

		const lastVersionsCount = all ? 0 : Number.parseInt(num);
		const versions = await git.getVersions({
			path,
			lastVersionsCount,
		}, this._options);
	
		if (!versions.length) {
			console.log(highlight.error('There are no version tags.'));
	
			return;
		}
	
		const limit = (lastVersionsCount <= versions.length ? lastVersionsCount : null) || versions.length;
	
		for (let i = 0; i < limit; i++) {
			const [ toTag, ...versionNumbers ] = versions[i];
			const [ fromTag ] = versions[i + 1] ? versions[i + 1] : [ null ];
	
			const version = this._createVersion(versionNumbers);
			const commits = await git.getCommits({ path, fromTag, toTag }, this._options);
	
			commits.forEach((data) => version.createCommit(data));
		}
	}
}
