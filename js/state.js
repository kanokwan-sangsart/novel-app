import { loadData, saveData } from './storage.js';

export const data = loadData();
export const novel = data.novels[0]; // ตอนนี้ใช้เรื่องแรกเรื่องเดียว

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

export function findChapter(id) {
  return novel.chapters.find(ch => ch.id === id);
}