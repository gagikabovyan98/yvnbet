import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateContent,parseImage} from './validation.mjs';
import {initialContent} from '../src/content.mjs';
test('accepts complete content and all three translations',()=>assert.equal(validateContent(structuredClone(initialContent)).brand,'YvnBet'));
test('rejects invalid links, missing fields and unexpected fields',()=>{for(const modify of [c=>c.loginUrl='javascript:alert(1)',c=>c.heroImage='data:image/svg+xml,<svg/>',c=>delete c.ru.title,c=>c.ru.unknown='text',c=>c.telegram='foo/bar',c=>c.games[0].type=4]){const c=structuredClone(initialContent);modify(c);assert.throws(()=>validateContent(c));}});
test('rejects HTML or SVG disguised as uploaded images',()=>{assert.throws(()=>parseImage('data:image/png;base64,'+Buffer.from('<script>alert(1)</script>').toString('base64')));assert.throws(()=>parseImage('data:image/svg+xml;base64,AAAA'));});
test('rejects oversized files',()=>assert.throws(()=>parseImage('data:image/png;base64,'+Buffer.alloc(4*1024*1024+1).toString('base64'))));
