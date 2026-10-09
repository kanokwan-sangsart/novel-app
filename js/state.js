import { loadData, saveData } from './storage.js';

export const data = loadData();

export const STATUSES = [
  { value: 'idea', label: 'ไอเดีย' },
  { value: 'draft', label: 'ร่าง' },
  { value: 'revise', label: 'กำลังแก้' },
  { value: 'done', label: 'เสร็จ' }
];

export function statusLabel(value) {
  const found = STATUSES.find(s => s.value === value);
  return found ? found.label : value;
}

export function save() {
  saveData(data);
}

export function getNovel(id) {
  return data.novels.find(n => n.id === id);
}

export function findChapter(novel, id) {
  return novel.chapters.find(ch => ch.id === id);
}

export function novelWords(novel) {
  return novel.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
}

// ตำแหน่งของบทที่แก้ล่าสุดในเรื่อง (เรียกเมื่อเรื่องมีบทอย่างน้อย 1 บท)
// ใช้บอกว่า "ทำค้างตรงไหน" ไม่ได้ใช้เรียงลำดับ
export function latestChapterIndex(novel) {
  let index = 0;
  novel.chapters.forEach((ch, i) => {
    if ((ch.updatedAt || 0) > (novel.chapters[index].updatedAt || 0)) index = i;
  });
  return index;
}

export function novelLastEdited(novel) {
  return novel.chapters.reduce(
    (max, ch) => Math.max(max, ch.updatedAt || 0),
    novel.createdAt || 0
  );
}