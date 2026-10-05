import { loadData, saveData, newId } from './storage.js';

const data = loadData();
const novel = data.novels[0]; // ตอนนี้ใช้เรื่องแรกเรื่องเดียว

const listEl = document.getElementById('chapter-list');
const addBtn = document.getElementById('add-chapter');
document.getElementById('novel-title').textContent = novel.title;

function save() {
  saveData(data);
}

function addChapter() {
  const now = Date.now();
  novel.chapters.push({
    id: newId(),
    title: '',
    content: '',
    status: 'draft',
    createdAt: now,
    updatedAt: now
  });
  save();
  render();
}

function renameChapter(index) {
  const ch = novel.chapters[index];
  const title = prompt('ชื่อบท', ch.title);
  if (title === null) return; // กดยกเลิก
  ch.title = title.trim();
  ch.updatedAt = Date.now();
  save();
  render();
}

function moveChapter(index, direction) {
  const target = index + direction;
  const list = novel.chapters;
  if (target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
  save();
  render();
}

function deleteChapter(index) {
  const ch = novel.chapters[index];
  const name = ch.title || `ลำดับที่ ${index + 1}`;
  if (!confirm(`ลบ "${name}" ใช่ไหม?`)) return;
  novel.chapters.splice(index, 1);
  save();
  render();
}

function makeButton(label, text, onClick, disabled = false) {
  const btn = document.createElement('button');
  btn.className = 'icon-btn';
  btn.textContent = text;
  btn.setAttribute('aria-label', label);
  btn.disabled = disabled;
  btn.addEventListener('click', onClick);
  return btn;
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short'
  });
}

function render() {
  listEl.innerHTML = '';

  if (novel.chapters.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'ยังไม่มีบท กด "เพิ่มบท" เพื่อเริ่มต้น';
    listEl.appendChild(empty);
    return;
  }

  novel.chapters.forEach((ch, i) => {
    const li = document.createElement('li');
    li.className = 'chapter-item';

    const info = document.createElement('div');
info.className = 'chapter-info';

const row = document.createElement('div');
row.className = 'chapter-row';

const num = document.createElement('span');
num.className = 'chapter-num';
num.textContent = i + 1;

const title = document.createElement('span');
title.className = 'chapter-title' + (ch.title ? '' : ' untitled');
title.textContent = ch.title || 'ยังไม่มีชื่อ';

row.append(num, title);

const meta = document.createElement('span');
meta.className = 'chapter-meta';
meta.textContent = 'สร้างเมื่อ ' + formatDate(ch.createdAt);

info.append(row, meta);
info.addEventListener('click', () => renameChapter(i));
    const last = novel.chapters.length - 1;
    li.append(
      info,
      makeButton('เลื่อนขึ้น', '↑', () => moveChapter(i, -1), i === 0),
      makeButton('เลื่อนลง', '↓', () => moveChapter(i, 1), i === last),
      makeButton('ลบ', '✕', () => deleteChapter(i))
    );
    listEl.appendChild(li);
  });
}

addBtn.addEventListener('click', addChapter);
render();