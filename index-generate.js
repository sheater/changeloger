const program = require('commander');

const main = require('./lib/main');

program
	.option('-a, --all', 'write all versions')
	.option('-n, --num <n>', 'number of last versions', 1)
	.option('-o, --output [file]', 'output file')
	.option('-p, --path [path]', 'input path')
	.option('-v, --verbose', 'verbose mode', false)
	.parse(process.argv);

main(program);
