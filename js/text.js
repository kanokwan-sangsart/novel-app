const segmenter =
  typeof Intl !== 'undefined' && Intl.Segmenter
    ? new Intl.Segmenter('th', { granularity: 'word' })
    : null;

export function countWords(text) {
  if (!text.trim()) return 0;
  if (!segmenter) return text.trim().split(/\s+/).length; // สำรอง ถ้าเบราว์เซอร์ไม่รองรับ

  let count = 0;
  for (const seg of segmenter.segment(text)) {
    if (seg.isWordLike) count++;
  }
  return count;
}