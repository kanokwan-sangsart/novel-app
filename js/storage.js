const KEY = 'novel-app-data';

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createEmptyData() {
  return {
    version: 1,
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

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}