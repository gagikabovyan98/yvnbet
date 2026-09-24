import { initialContent } from '../src/content.mjs';
export function validImage(value) {
  return typeof value === 'string' && (/^\/images\/[a-zA-Z0-9._-]+$/.test(value) || /^\/uploads\/[a-f0-9-]+\.(png|jpg|webp)$/.test(value) || /^https:\/\/[^\s]+$/.test(value));
}
export function validateContent(value) {
  function shape(v, template, path='') {
    if (typeof template === 'string') { if (typeof v !== 'string' || v.length > 6000 || !v.trim()) throw new Error(`Некорректное поле: ${path}`); }
    else if (typeof template === 'number') { if (!Number.isInteger(v) || v<1 || v>3) throw new Error('Некорректная категория'); }
    else if (Array.isArray(template)) { if (!Array.isArray(v) || v.length !== template.length) throw new Error(`Некорректный список: ${path}`); v.forEach((x,i)=>shape(x,template[i],`${path}.${i}`)); }
    else { if (!v || typeof v!=='object' || Object.keys(v).some(k=>!(k in template))) throw new Error(`Некорректный объект: ${path}`); for (const k of Object.keys(template)) shape(v[k],template[k],`${path}.${k}`); }
  }
  shape(value,initialContent);
  if (!/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value.telegram)) throw new Error('Укажите Telegram username без @');
  if (value.loginUrl !== 'https://ggplus.pro') throw new Error('Разрешена только платформа https://ggplus.pro');
  if (!validImage(value.heroImage) || value.games.some(g=>!validImage(g.image))) throw new Error('Некорректный адрес изображения');
  return value;
}
export function parseImage(data) {
  const match = typeof data === 'string' && data.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error('Поддерживаются PNG, JPEG и WebP');
  const bytes=Buffer.from(match[2],'base64');
  if (bytes.length > 4*1024*1024) throw new Error('Максимальный размер — 4 МБ');
  const valid=match[1]==='png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):match[1]==='jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
  if(!valid) throw new Error('Формат файла не соответствует содержимому');
  return {bytes,ext:match[1]==='jpeg'?'jpg':match[1]};
}
