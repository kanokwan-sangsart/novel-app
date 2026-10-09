import { data, novel } from './state.js';
import {
  isValidData,
  saveData,
  keepSafetyCopy,
  getLastBackup,
  markBackupDone
} from './storage.js';
import { downloadFile, todayStamp, safeFileName } from './files.js';

// "บทที่ N" โผล่ตรงนี้ เพราะตอนส่งออก ลำดับคือสิ่งที่ผู้อ่านจะเห็นจริง
function buildNovelText(n) {
  const parts = [n.title, '', ''];
  n.chapters.forEach((ch, i) => {
    const head = `บทที่ ${i + 1}` + (ch.title ? ` ${ch.title}` : '');
    parts.push(head, '', (ch.content || '').trim(), '', '');
  });
  return parts.join('\n');
}

function describeLastBackup() {
  const last = getLastBackup();
  if (!last) return 'ยังไม่เคยสำรองข้อมูลบนเครื่องนี้';
  const when = new Date(last).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  return `สำรองล่าสุด: ${when}`;
}

export function renderBackup(app) {
  app.innerHTML = `
    <div class="editor-bar">
      <button class="icon-btn" id="back" aria-label="กลับ">←</button>
      <strong>สำรอง / นำเข้าข้อมูล</strong>
    </div>
    <div class="editor">
      <section class="panel">
        <h2>สำรองข้อมูล</h2>
        <p id="last-backup"></p>
        <button class="btn-primary" id="export-json">ดาวน์โหลดไฟล์สำรอง (.json)</button>
      </section>

      <section class="panel">
        <h2>นำเข้าข้อมูล</h2>
        <p>เลือกไฟล์สำรองที่เคยดาวน์โหลดไว้ ข้อมูลบนเครื่องนี้จะถูกแทนที่ทั้งหมด</p>
        <button class="btn-secondary" id="import-btn">เลือกไฟล์สำรอง</button>
        <input type="file" id="import-file" accept=".json,application/json" hidden>
      </section>

      <section class="panel">
        <h2>ส่งออกเป็นข้อความ</h2>
        <p>รวมทุกบทตามลำดับในเรื่อง เป็นไฟล์ .txt สำหรับนำไปวางที่อื่น</p>
        <button class="btn-secondary" id="export-txt">ดาวน์โหลดเป็น .txt</button>
      </section>
    </div>
  `;

  const lastEl = document.getElementById('last-backup');
  const fileInput = document.getElementById('import-file');
  lastEl.textContent = describeLastBackup();

  document.getElementById('back').addEventListener('click', () => {
    location.hash = '#/';
  });

  document.getElementById('export-json').addEventListener('click', () => {
    const json = JSON.stringify(data, null, 2);
    downloadFile(`novel-backup-${todayStamp()}.json`, json, 'application/json');
    markBackupDone();
    lastEl.textContent = describeLastBackup();
  });

  document.getElementById('export-txt').addEventListener('click', () => {
    const name = `${safeFileName(novel.title)}-${todayStamp()}.txt`;
    downloadFile(name, buildNovelText(novel), 'text/plain');
  });

  document.getElementById('import-btn').addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    try {
      const imported = JSON.parse(await file.text());

      if (!isValidData(imported)) {
        alert('ไฟล์นี้ไม่ใช่ไฟล์สำรองของแอปนี้ หรือข้อมูลไม่ครบ');
        return;
      }

      const chapterCount = imported.novels.reduce(
        (sum, n) => sum + n.chapters.length,
        0
      );
      const ok = confirm(
        `ในไฟล์มี ${imported.novels.length} เรื่อง ${chapterCount} บท\n` +
        'ข้อมูลปัจจุบันบนเครื่องนี้จะถูกแทนที่ทั้งหมด ดำเนินการต่อไหม?'
      );
      if (!ok) return;

      keepSafetyCopy();      // เก็บสำเนาข้อมูลเดิมไว้ก่อน
      saveData(imported);
      location.hash = '#/';
      location.reload();     // โหลดใหม่ เพื่อให้ทุกหน้าใช้ข้อมูลชุดใหม่
    } catch (e) {
      alert('อ่านไฟล์ไม่สำเร็จ: ' + e.message);
    } finally {
      fileInput.value = ''; // ให้เลือกไฟล์เดิมซ้ำได้
    }
  });

  return null; // หน้านี้ไม่มีอะไรต้องเก็บกวาด
}