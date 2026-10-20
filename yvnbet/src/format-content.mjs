// Render CMS plain text as structure, never executable HTML. Keep the author's words.
export function instructionBlocks(text) {
  const lines = text.replace(/\r\n?/g, '\n').split(/\n\s*\n|\n(?=\s*(?:(?:Шаг|Քայլ|Step)\s+)?\d+[.):։]\s+)/i).map(s=>s.trim()).filter(Boolean);
  const blocks = [];
  for (const line of lines) {
    if (/^(android|ios)$/i.test(line)) blocks.push({type:'heading', text:line === 'ANDROID' ? 'Android' : line});
    else if (/^(?:(?:Шаг|Քայլ|Step)\s+\d+[.:։]?\s*|\d+[.):։]\s+)/i.test(line)) {
      const value = line.replace(/^(?:(?:Шаг|Քայլ|Step)\s+\d+[.:։]?\s*|\d+[.):։]\s+)/i, '');
      if (blocks.at(-1)?.type === 'steps') blocks.at(-1).items.push(value);
      else blocks.push({type:'steps', items:[value]});
    } else blocks.push({type: /^YVNBET\s/i.test(line) && line.length < 45 ? 'label' : 'paragraph', text:line});
  }
  return blocks;
}
