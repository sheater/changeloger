const fs = require('fs');

const Changelog = require('./Changelog');
const git = require('./git');
const { highlight } = require('./utils');

module.exports = async function generate (options) {
	try {
		const startTime = new Date();

		const changelog = new Changelog(options);
		const data = await changelog.generate();

		fs.writeFileSync(options.output, data);

		console.log(highlight.success(
			`Changelog successfully written to "${options.output}" after ${new Date() - startTime} ms.`
		));
	}
	catch (error) {
		console.log(highlight.error('generate()'), error);
	}
}
