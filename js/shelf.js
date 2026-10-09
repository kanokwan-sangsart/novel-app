import {
  data,
  save,
  novelWords,
  novelLastEdited
} from './state.js';
import { newId, getLastBackup, keepSafetyCopy } from './storage.js';
import { formatDate } from './text.js';

function makeBanner() {
  const hasContent = data.novels.some(n => novelWords(n) > 0);
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

// บทที่แก้ล่าสุดจาก "ทุกเรื่อง"
function makeContinueCard() {
  let best = null;
  data.novels.forEach(n => {
    n.chapters.forEach(ch => {
      if (!best || (ch.updatedAt || 0) > (best.ch.updatedAt || 0)) {
        best = { n, ch };
      }
    });
  });
  if (!best) return null;

  const a = document.createElement('a');
  a.className = 'continue-card';
  a.href = `#/n/${best.n.id}/c/${best.ch.id}`;

  const label = document.createElement('span');
  label.className = 'continue-label';
  label.textContent = `เขียนต่อ · ${best.n.title}`;

  const title = document.createElement('span');
  title.className = 'continue-title';
  title.textContent = best.ch.title || 'ยังไม่มีชื่อ';

  a.append(label, title);

  if (best.ch.nextNote) {
    const next = document.createElement('span');
    next.className = 'continue-next';
    next.textContent = '➜ ' + best.ch.nextNote;
    a.append(next);
  }
  return a;
}

export function renderShelf(app) {
  app.innerHTML = `
    <header class="topbar">
      <h1>ชั้นนิยาย</h1>
      <a class="top-link" href="#/backup">สำรอง / นำเข้า</a>
    </header>
    <main>
      <div id="banner-slot"></div>
      <div id="continue-slot"></div>
      <ul class="chapter-list" id="novel-list"></ul>
      <button class="btn-primary" id="add-novel">+ เริ่มนิยายเรื่องใหม่</button>
    </main>
  `;

  const listEl = document.getElementById('novel-list');

  const banner = makeBanner();
  if (banner) document.getElementById('banner-slot').appendChild(banner);
  const card = makeContinueCard();
  if (card) document.getElementById('continue-slot').appendChild(card);

  document.getElementById('add-novel').addEventListener('click', addNovel);

  function addNovel() {
    const title = prompt('ชื่อเรื่อง');
    if (title === null) return; // กดยกเลิก
    const novel = {
      id: newId(),
      title: title.trim() || 'ยังไม่มีชื่อเรื่อง',
      genre: 'blank', // รอบ 2 จะมีให้เลือกแนวและเทมเพลตตรงนี้
      createdAt: Date.now(),
      chapters: []
    };
    data.novels.push(novel);
    save();
    location.hash = `#/n/${novel.id}`;

    
  }

  function deleteNovel(index) {
    const novel = data.novels[index];
    const words = novelWords(novel).toLocaleString('th-TH');
    const typed = prompt(
      `จะลบเรื่อง "${novel.title}" (${novel.chapters.length} บท ${words} คำ) ถาวร\n` +
      'พิมพ์ชื่อเรื่องให้ตรงเพื่อยืนยัน'
    );
    if (typed === null) return;
    if (typed.trim() !== novel.title) {
      alert('ชื่อไม่ตรง ยกเลิกการลบ');
      return;
    }
    keepSafetyCopy('before-delete'); // เก็บสำเนาข้อมูลก่อนลบไว้อีกชั้น
    data.novels.splice(index, 1);
    save();
    location.reload();
  }

  function fillList() {
    listEl.innerHTML = '';

    if (data.novels.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'empty';
      empty.textContent = 'ยังไม่มีนิยาย กด "เริ่มนิยายเรื่องใหม่"';
      listEl.appendChild(empty);
      return;
    }

    data.novels.forEach((novel, i) => {
      const li = document.createElement('li');
      li.className = 'chapter-item novel-item';

      const info = document.createElement('div');
      info.className = 'chapter-info';

      const row = document.createElement('div');
      row.className = 'chapter-row';
      const title = document.createElement('span');
      title.className = 'chapter-title';
      title.textContent = novel.title;
      row.append(title);

      const meta = document.createElement('span');
      meta.className = 'chapter-meta';
      const words = novelWords(novel).toLocaleString('th-TH');
      meta.textContent =
        `${novel.chapters.length} บท · ${words} คำ · แก้ล่าสุด ${formatDate(novelLastEdited(novel))}`;

      info.append(row, meta);
      info.addEventListener('click', () => {
        location.hash = `#/n/${novel.id}`;
      });

      const del = document.createElement('button');
      del.className = 'icon-btn';
      del.textContent = '✕';
      del.setAttribute('aria-label', 'ลบเรื่องนี้');
      del.addEventListener('click', () => deleteNovel(i));

      li.append(info, del);
      listEl.appendChild(li);
    });
  }

  fillList();
}