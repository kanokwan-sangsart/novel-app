import { findChapter, save, STATUSES } from './state.js';
import { countWords } from './text.js';

   export function renderEditor(app, novel, chapterId)  {
     const ch = findChapter(novel, chapterId);
  if (!ch) {
       location.hash = `#/n/${novel.id}`; // ไม่พบบทนี้ กลับไปหน้ารายการ
    return null;
  }

  // โครงหน้า (ไม่มีข้อมูลของผู้ใช้ปนอยู่ จึงใช้ innerHTML ได้)
  app.innerHTML = `
    <div class="editor-bar">
      <button class="icon-btn" id="back" aria-label="กลับไปรายการบท">←</button>
      <span class="spacer"></span>
      <span class="save-status" id="save-status">บันทึกแล้ว</span>
    </div>
    <div class="editor">
      <input class="title-input" id="title" placeholder="ชื่อบท" autocomplete="off">
      <label>
        <span class="field-label">สถานะ</span>
        <select class="status-select" id="status"></select>
      </label>
      <label>
        <span class="field-label">ป้ายบอกทาง: ฉากถัดไป / จะเขียนต่ออย่างไร</span>
        <textarea class="note-input" id="next-note"
          placeholder="จดสั้นๆ ก่อนปิด เช่น ฉากที่พระเอกเจอจดหมายในลิ้นชัก"></textarea>
      </label>
      <textarea class="content-input" id="content" placeholder="เริ่มเขียนที่นี่..."></textarea>
      <div class="counts" id="counts"></div>
    </div>
  `;

  const titleInput = document.getElementById('title');
  const statusSelect = document.getElementById('status');
  const noteInput = document.getElementById('next-note');
  const contentInput = document.getElementById('content');
  const countsEl = document.getElementById('counts');
  const saveStatusEl = document.getElementById('save-status');

  // ใส่ค่าเดิมของบท (ใช้ .value ไม่ใช้ innerHTML)
  titleInput.value = ch.title || '';
  noteInput.value = ch.nextNote || '';
  contentInput.value = ch.content || '';

  STATUSES.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.value;
    opt.textContent = s.label;
    statusSelect.appendChild(opt);
  });
  statusSelect.value = ch.status || 'draft';

  if (ch.wordCount === undefined) {
    ch.wordCount = countWords(contentInput.value);
  }

  function updateCounts() {
    const chars = contentInput.value.replace(/\s/g, '').length;
    countsEl.textContent =
      `${(ch.wordCount || 0).toLocaleString('th-TH')} คำ · ` +
      `${chars.toLocaleString('th-TH')} ตัวอักษร`;
  }

  // ----- บันทึกอัตโนมัติ -----
  let timer = null;

  function saveNow() {
    clearTimeout(timer);
    timer = null;

    ch.title = titleInput.value.trim();
    ch.status = statusSelect.value;
    ch.nextNote = noteInput.value;
    ch.content = contentInput.value;
    ch.wordCount = countWords(ch.content);
    ch.updatedAt = Date.now();

    save();
    saveStatusEl.textContent = 'บันทึกแล้ว';
    updateCounts();
  }

  function scheduleSave() {
    saveStatusEl.textContent = 'กำลังบันทึก...';
    clearTimeout(timer);
    timer = setTimeout(saveNow, 600);
  }

  function flush() {
    if (timer !== null) saveNow(); // มีของที่ยังไม่ได้บันทึก ให้บันทึกทันที
  }

  function onVisibility() {
    if (document.visibilityState === 'hidden') flush();
  }

  [titleInput, noteInput, contentInput].forEach(el =>
    el.addEventListener('input', scheduleSave)
  );
  statusSelect.addEventListener('change', scheduleSave);

    document.getElementById('back').addEventListener('click', () => {
    location.hash = `#/n/${novel.id}`;
  });

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', flush);

  updateCounts();

  // ส่งฟังก์ชันเก็บกวาดกลับไป ตัวสลับหน้าจะเรียกก่อนออกจากหน้านี้
  return function cleanup() {
    flush();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', flush);
  };
}