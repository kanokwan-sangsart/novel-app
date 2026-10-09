const KEY = 'novel-app-data';
const BACKUP_KEY = 'novel-app-last-backup';
export const DATA_VERSION = 1;

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createEmptyData() {
  return {
    version: DATA_VERSION,
    novels: [
      { id: newId(), title: 'นิยายเรื่องแรก', genre: 'blank', chapters: [] }
    ]
  };
}

export function loadData() {
  const raw = localStorage.getItem(KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      // ข้อมูลเสีย: เก็บสำเนาไว้ก่อน จะได้ไม่ถูกเขียนทับแล้วหายถาวร
      console.error('อ่านข้อมูลไม่สำเร็จ', e);
      localStorage.setItem(KEY + '-corrupt-backup', raw);
    }
  }
  return createEmptyData();
}

let warned = false;

export function saveData(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {
    console.error('บันทึกไม่สำเร็จ', e);
    if (!warned) {
      warned = true;
      alert('บันทึกข้อมูลไม่สำเร็จ พื้นที่เก็บข้อมูลอาจเต็ม ควรสำรองข้อมูลเป็นไฟล์ทันที');
    }
  }
}

// ตรวจว่าไฟล์ที่นำเข้าหน้าตาเหมือนข้อมูลของแอปนี้จริง
export function isValidData(obj) {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.version === 'number' &&
    obj.version <= DATA_VERSION &&
    Array.isArray(obj.novels) &&
    obj.novels.every(
      n =>
        n &&
        Array.isArray(n.chapters) &&
        n.chapters.every(c => c && typeof c.id === 'string')
    )
  );
}

// เก็บสำเนาข้อมูลปัจจุบันไว้ก่อนนำเข้าไฟล์ใหม่
export function keepSafetyCopy(reason = 'before-import') {
  const current = localStorage.getItem(KEY);
  if (current) localStorage.setItem(KEY + '-' + reason, current);
}

export function getLastBackup() {
  return Number(localStorage.getItem(BACKUP_KEY)) || null;
}

export function markBackupDone() {
  localStorage.setItem(BACKUP_KEY, String(Date.now()));
}