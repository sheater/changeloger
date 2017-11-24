const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

function capitalizeFirstLetter (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const highlight = {
	error: (str) => `\x1b[31m${str}\x1b[0m`,
	warning: (str) => `\x1b[33m${str}\x1b[0m`,
	success: (str) => `\x1b[32m${str}\x1b[0m`,
	debug: (str) => `\x1b[35m${str}\x1b[0m`,
};

module.exports = { execAsync, highlight, capitalizeFirstLetter };
