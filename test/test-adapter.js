/*global describe, it */
const assert = require('assert');
const fs = require('fs'); // eslint-disable-line no-unused-vars
const path = require('path').posix; // eslint-disable-line no-unused-vars
const DirectoryTester = require('../dev/DirectoryTester.js');
const { name, cloneRun } = new DirectoryTester(__filename);

const sassAdapter = require('../index.js');

const devOutput = `
.a {
  padding: 5px;
}

.b {
  --b: "b";
}

.c {
  content: "C";
}

/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYS9hLnNjc3MiLCIuLi9zcmMvYi9iLmNzcyIsIi4uL3NyYy9jL2Muc2NzcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtFQUNDLFNBRkc7OztBQ0FKO0VBQ0M7OztBQ0FEO0VBQ0MsU0FGRyJ9 */
`;

const distOutput = '.a{padding:5px}.b{--b: "b"}.c{content:"C"}';

describe(name, async () => {
	it('should compile dev sass with sourcemap', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
		
			await sassAdapter.run({
				isDev: true,
				entryPath: `${base}/dev/entry.scss`,
				outputPath: `${base}/dev/output.css`,
				sourcePaths: [
					`../src/a/a.scss`,
					`../src/b/b.css`,
					`../src/c/c.scss`,
				],
			});
			
			const after = box.snapshot();
			
			assert.equal(
				after['dev/entry.scss'],
				'@use "../src/a/a.scss";\n@use "../src/b/b.css";\n@use "../src/c/c.scss";'
			);

			assert.equal(
				after['dev/output.css'].trim(),
				devOutput.trim()
			);
		});
	});

	it('should compile dist sass compressed', async () => {
		await cloneRun(async (base, box) => { // eslint-disable-line no-unused-vars
		
			await sassAdapter.run({
				isDev: false,
				entryPath: `${base}/dist/entry.scss`,
				outputPath: `${base}/dist/output.css`,
				sourcePaths: [
					`../src/a/a.scss`,
					`../src/b/b.css`,
					`../src/c/c.scss`,
				],
			});
			
			const after = box.snapshot();
			
			assert.equal(
				after['dist/entry.scss'],
				'@use "../src/a/a.scss";\n@use "../src/b/b.css";\n@use "../src/c/c.scss";'
			);

			assert.equal(
				after['dist/output.css'].trim(),
				distOutput.trim()
			);
		});
	});
});

