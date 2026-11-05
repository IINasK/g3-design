import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';

/** Release identity must agree before the demo or a distributable is built. */
export async function checkRelease(root = new URL('../', import.meta.url)) {
  const read = path => readFile(new URL(path, root), 'utf8');
  const {version} = JSON.parse(await read('package.json'));
  assert.match(version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/, 'Use a stable X.Y.Z release version.');
  const skill = await read('skills/g3-design/SKILL.md');
  assert.equal(skill.match(/^  version: "([^"\r\n]+)"$/m)?.[1], version, 'Skill and package versions differ.');
  const lock = JSON.parse(await read('package-lock.json'));
  assert.equal(lock.version, version, 'Lockfile version differs.');
  assert.equal(lock.packages[''].version, version, 'Root lockfile package version differs.');
  const tag = `v${version}`;
  const source = `https://github.com/IINasK/g3-design/tree/${tag}`;
  for (const name of ['README.md', 'README.en.md']) {
    const commands = (await read(name)).split('\n').filter(line => line.startsWith('npx ') && line.includes(' add '));
    assert.equal(commands.length, 6, `${name}: provide one installation command per supported agent.`);
    for (const command of commands) {
      assert.ok(command.includes(` add ${source} --skill g3-design `), `${name}: stale release installation source.`);
      assert.ok(command.includes(' --copy --yes'), `${name}: preserve the documented copy installation.`);
    }
  }
  return {version, tag, source};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const {tag} = await checkRelease();
  console.log(`${tag}: release identity and installation commands agree.`);
}
