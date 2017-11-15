const Version = require('./Version');

module.exports = class Changelog {
	constructor (options) {
		this._versions = [];
		this._options = options;
	}

	createVersion (numbers) {
		const version = new Version(numbers, this._options);
		this._versions.push(version);

		return version;
	}

	serialize (options) {
		return this._versions.reduce((acc, version) => {
			acc += version.serialize(options);

			return acc;
		}, '# Changelog  \n');
	}
}
