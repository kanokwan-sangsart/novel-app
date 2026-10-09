import { novel, save, statusLabel } from './state.js';
import { newId, getLastBackup } from './storage.js';


function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short'
  });
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

function makeBanner() {
  const hasContent = novel.chapters.some(ch => (ch.wordCount || 0) > 0);
  if (!hasContent) return null;

  const last = getLastBackup();
  const days = last ? Math.floor((Date.now() - last) / 86400000) : null;
  if (last && days < 7) return null; // เพิ่งสำรองไว้ ยังไม่ต้องเตือน

  const a = document.createElement('a');
  a.className = 'banner';
  a.href = '#/backup';
  a.textContent = last
    ? `⚠ สำรองข้อมูลล่าสุดเมื่อ ${days} วันที่แล้ว แตะเพื่อสำรองตอนนี้`
    : '⚠ ยังไม่เคยสำรองข้อมูล แตะเพื่อสำรองตอนนี้';
  return a;
}

function makeContinueCard() {
  if (novel.chapters.length === 0) return null;

  // หาบทที่แก้ไขล่าสุด (ใช้เวลาบอกว่าค้างตรงไหน ไม่ได้ใช้เรียงลำดับ)
  let index = 0;
  novel.chapters.forEach((ch, i) => {
    if ((ch.updatedAt || 0) > (novel.chapters[index].updatedAt || 0)) index = i;
  });
  const ch = novel.chapters[index];

  const a = document.createElement('a');
  a.className = 'continue-card';
  a.href = `#/chapter/${ch.id}`;

  const label = document.createElement('span');
  label.className = 'continue-label';
  label.textContent = `เขียนต่อ · ลำดับที่ ${index + 1}`;

  const title = document.createElement('span');
  title.className = 'continue-title';
  title.textContent = ch.title || 'ยังไม่มีชื่อ';

  a.append(label, title);

  if (ch.nextNote) {
    const next = document.createElement('span');
    next.className = 'continue-next';
    next.textContent = '➜ ' + ch.nextNote;
    a.append(next);
  }
  return a;
}

export function renderList(app) {
    app.innerHTML = `
    <header class="topbar">
      <h1 id="novel-title"></h1>
      <a class="top-link" href="#/backup">สำรอง / นำเข้า</a>
    </header>
    <main>
      <div id="banner-slot"></div>
      <div id="continue-slot"></div>
      <ul class="chapter-list" id="chapter-list"></ul>
      <button class="btn-primary" id="add-chapter">+ เพิ่มบท</button>
    </main>
  `;
  document.getElementById('novel-title').textContent = novel.title;
  const listEl = document.getElementById('chapter-list');

  const banner = makeBanner();
  if (banner) document.getElementById('banner-slot').appendChild(banner);
  const card = makeContinueCard();
  if (card) document.getElementById('continue-slot').appendChild(card);

  document.getElementById('add-chapter').addEventListener('click', addChapter);

  function addChapter() {
    const now = Date.now();
    const ch = {
      id: newId(),
      title: '',
      content: '',
      nextNote: '',
      status: 'draft',
      wordCount: 0,
      createdAt: now,
      updatedAt: now
    };
    novel.chapters.push(ch);
    save();
    location.hash = `#/chapter/${ch.id}`; // เพิ่มแล้วเข้าหน้าเขียนเลย
  }

  function moveChapter(index, direction) {
    const target = index + direction;
    const list = novel.chapters;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    save();
    fillList();
  }

  function deleteChapter(index) {
    const ch = novel.chapters[index];
    const name = ch.title || `ลำดับที่ ${index + 1}`;
    if (!confirm(`ลบ "${name}" ใช่ไหม? เนื้อหาในบทนี้จะหายด้วย`)) return;
    novel.chapters.splice(index, 1);
    save();
    fillList();
  }

  function fillList() {
    listEl.innerHTML = '';

    if (novel.chapters.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'ยังไม่มีบท กด "เพิ่มบท" เพื่อเริ่มต้น';
      listEl.appendChild(empty);
      return;
    }

    const last = novel.chapters.length - 1;

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
      const words = (ch.wordCount || 0).toLocaleString('th-TH');
      meta.textContent =
        `${statusLabel(ch.status)} · ${words} คำ · สร้างเมื่อ ${formatDate(ch.createdAt)}`;

      info.append(row, meta);

      if (ch.nextNote) {
        const next = document.createElement('span');
        next.className = 'chapter-next';
        next.textContent = '➜ ' + ch.nextNote;
        info.append(next);
      }

      info.addEventListener('click', () => {
        location.hash = `#/chapter/${ch.id}`;
      });

      li.append(
        info,
        makeButton('เลื่อนขึ้น', '↑', () => moveChapter(i, -1), i === 0),
        makeButton('เลื่อนลง', '↓', () => moveChapter(i, 1), i === last),
        makeButton('ลบ', '✕', () => deleteChapter(i))
      );
      listEl.appendChild(li);
    });
  }

  fillList();
}