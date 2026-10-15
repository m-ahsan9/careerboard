import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
test('local server serves app assets and rejects unlisted files', {timeout:10000}, async () => {
  const child = spawn(process.execPath,['server.js'],{cwd:new URL('.',import.meta.url),env:{...process.env,PORT:'3018'},stdio:['ignore','pipe','pipe']});
  try {
    await Promise.race([once(child.stdout,'data'),once(child,'exit').then(() => { throw new Error('Server exited before startup'); })]);
    for (const path of ['/','/app.js','/styles.css','/domain.js']) {
      const response = await fetch(`http://127.0.0.1:3018${path}`);
      assert.equal(response.status,200,path);
      assert.ok((await response.text()).length > 0,path);
      assert.equal(response.headers.get('x-content-type-options'),'nosniff');
    }
    for (const path of ['/missing','/package.json','/.env']) assert.equal((await fetch(`http://127.0.0.1:3018${path}`)).status,404);
    assert.equal((await fetch('http://127.0.0.1:3018/',{method:'HEAD'})).status,200);
  } finally { const exited = once(child,'exit'); child.kill(); await exited; }
});
