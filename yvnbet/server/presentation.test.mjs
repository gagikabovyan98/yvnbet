import {test} from 'node:test';
import assert from 'node:assert/strict';
import {instructionBlocks} from '../src/format-content.mjs';
import {regionOptions} from '../src/regions.mjs';
import {initialContent, upgradeAndroidAppCopy, upgradeCatalogPresentation, catalogSlides, publicContent} from '../src/content.mjs';
import {validateContent} from './validation.mjs';

test('install copy retains author wording and groups translated steps with separate platform headings', () => {
  for (const step of ['Шаг','Քայլ','Step']) {
    assert.deepEqual(instructionBlocks(`YVNBET APP\n\nIntro\n\nANDROID\n\n${step} 1. Open Chrome\n\n${step} 2. Add\n\niOS\n\n${step} 1. Open Safari`), [
      {type:'label',text:'YVNBET APP'}, {type:'paragraph',text:'Intro'}, {type:'heading',text:'Android'},
      {type:'steps',items:['Open Chrome','Add']}, {type:'heading',text:'iOS'}, {type:'steps',items:['Open Safari']}
    ]);
  }
  assert.deepEqual(instructionBlocks('Custom\ntext <script>doNotRun()</script>'), [{type:'paragraph',text:'Custom\ntext <script>doNotRun()</script>'}]);
});
test('community suggestions search Armenian, Russian, English and provinces without restricting free-form input', () => {
  assert.ok(regionOptions('hy').length >= 60);
  assert.ok(regionOptions('hy','Гюмри').some(o=>o.name === 'Գյումրի'));
  assert.ok(regionOptions('en','Երևան').some(o=>o.name === 'Yerevan'));
  assert.ok(regionOptions('ru','Kotayk').length > 5);
  assert.deepEqual(regionOptions('ru','unlisted-region'), []);
});
test('catalog uses home artwork by default while preserving independent banners and custom app copy', () => {
  const old = structuredClone(initialContent);
  delete old.settings.catalogSliderSource;
  old.interface.hy.city = 'Քաղաք';
  old.slotSlides = [{...structuredClone(old.slides[0]),id:'slot',slug:'slot'}];
  const c = upgradeCatalogPresentation(old);
  assert.equal(c.interface.hy.city,'Համայնք');
  assert.deepEqual(c.slotSlides,old.slotSlides);
  assert.deepEqual(c.pages,old.pages);
  assert.equal(validateContent(c).settings.catalogSliderSource,'home');
  assert.equal(catalogSlides(c,'slots'),c.slides);
  assert.equal(catalogSlides(c,'providers'),c.slides);
  c.settings.catalogSliderSource = 'independent';
  assert.equal(catalogSlides(c,'slots'),c.slotSlides);
  assert.equal(catalogSlides(c,'providers'),c.slides);
  c.slotSlides[0].enabled = false;
  const visible = publicContent(c);
  assert.equal(catalogSlides(visible,'slots'),visible.slides);
  assert.deepEqual(upgradeCatalogPresentation(c),c);
});

test('Android guide migration removes the iOS section and preserves editable custom copy', () => {
  const old = structuredClone(initialContent);
  const app = old.pages.find(p => p.slug === 'app');
  const endings = {ru:'📱 Доступно для устройств Android и iOS',hy:'📱 Հասանելի է Android և iOS սարքերի համար',en:'📱 Available for Android and iOS devices'};
  for (const [lang, ending] of Object.entries(endings)) app.description[lang] = `Intro\n\nANDROID\n\nChrome steps\n\niOS\n\nSafari steps\n\n${ending}\n\nFooter`;
  const updated = upgradeAndroidAppCopy(old);
  for (const text of Object.values(updated.pages.find(p => p.slug === 'app').description)) {
    assert.ok(text.includes('Chrome steps'));
    assert.ok(text.includes('Footer'));
    assert.doesNotMatch(text, /iOS|Safari/);
  }
  assert.deepEqual(upgradeAndroidAppCopy(updated), updated);
  app.description.ru = 'Custom Android and iOS guide';
  assert.equal(upgradeAndroidAppCopy(old).pages.find(p => p.slug === 'app').description.ru, app.description.ru);
});
