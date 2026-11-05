import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, mkdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join, dirname, basename, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {checkRelease} from '../scripts/check-release.mjs';

async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'g3-release-'));
  t.after(async () => {
    assert.equal(dirname(resolve(dir)), resolve(tmpdir()));
    assert.ok(basename(dir).startsWith('g3-release-'));
    await rm(dir, {recursive: true, force: true});
  });
  const root = pathToFileURL(dir + '/');
  await mkdir(new URL('skills/g3-design/', root), {recursive: true});
  await writeFile(new URL('package.json', root), JSON.stringify({version: '1.2.3'}));
  await writeFile(new URL('package-lock.json', root), JSON.stringify({version: '1.2.3', packages: {'': {version: '1.2.3'}}}));
  await writeFile(new URL('skills/g3-design/SKILL.md', root), '---\nmetadata:\n  version: "1.2.3"\n---\n');
  const commands = Array.from({length: 6}, (_, i) => `npx --yes skills@1.7.6 add https://github.com/IINasK/g3-design/tree/v1.2.3 --skill g3-design --agent agent-${i} --copy --yes`).join('\n');
  for (const name of ['README.md', 'README.en.md']) await writeFile(new URL(name, root), commands);
  return root;
}

test('the actual release is consistent', async () => { await checkRelease(); });
test('matching independent release fixture is accepted', async t => {
  assert.equal((await checkRelease(await fixture(t))).tag, 'v1.2.3');
});
test('stale skill metadata prevents a release', async t => {
  const root = await fixture(t);
  await writeFile(new URL('skills/g3-design/SKILL.md', root), '---\nmetadata:\n  version: "1.2.2"\n---\n');
  await assert.rejects(checkRelease(root), /Skill and package versions differ/);
});
test('stale lockfile prevents a release', async t => {
  const root = await fixture(t);
  await writeFile(new URL('package-lock.json', root), JSON.stringify({version: '1.2.3', packages: {'': {version: '1.2.2'}}}));
  await assert.rejects(checkRelease(root), /Root lockfile package version differs/);
});
test('an unpinned or stale installation command prevents a release', async t => {
  const root = await fixture(t);
  await writeFile(new URL('README.en.md', root), Array(6).fill('npx skills add IINasK/g3-design --skill g3-design --copy --yes').join('\n'));
  await assert.rejects(checkRelease(root), /stale release installation source/);
});
