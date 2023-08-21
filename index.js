const sass = require('sass');
const fs = require('fs');
const path = require('path').posix;

module.exports.inputTypes = ['scss', 'css'];

module.exports.run = async ({entryPath, isDev, outputPath, sourcePaths}) => {
	const entryFile = sourcePaths.map(source => `@use ${JSON.stringify(source)};`).join('\n');
	const options = isDev ? {
		sourceMap: true,
	} : {
		style: 'compressed',
	};

	await Promise.all([
		fs.promises.mkdir(path.dirname(entryPath), {recursive: true}),
		fs.promises.mkdir(path.dirname(outputPath), {recursive: true}),
	]);
	
	await fs.promises.writeFile(entryPath, entryFile, 'utf8');

	const result = sass.compile(entryPath, options);
	let css = result.css;
	
	if (result.sourceMap) {
		// Relativize source paths to the output file.
		result.sourceMap.sources = result.sourceMap.sources.map(source => {
			source = source.replace(/^file:\/\//, '');
			source = path.relative(path.dirname(outputPath), source);
			return source;
		});

		// Embed the source map in the css file.
		// Thanks to: https://github.com/sass/dart-sass/issues/1594#issuecomment-1013208452
		const map = Buffer.from(JSON.stringify(result.sourceMap), 'utf8').toString('base64');
		css += `\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,${map} */`;
	}

	await fs.promises.writeFile(outputPath, css, 'utf8');
};
