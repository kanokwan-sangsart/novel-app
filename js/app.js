import { renderShelf } from './shelf.js';
import { renderList } from './list.js';
import { renderEditor } from './editor.js';
import { renderBackup } from './backup.js';
import { getNovel } from './state.js';

const app = document.getElementById('app');
let cleanup = null;

function route() {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }

  const hash = location.hash || '#/';
  const chapterMatch = hash.match(/^#\/n\/([^/]+)\/c\/([^/]+)$/);
  const novelMatch = hash.match(/^#\/n\/([^/]+)$/);

  if (hash === '#/backup') {
    cleanup = renderBackup(app);
  } else if (chapterMatch) {
    const novel = getNovel(chapterMatch[1]);
    if (novel) cleanup = renderEditor(app, novel, chapterMatch[2]);
    else location.hash = '#/';
  } else if (novelMatch) {
    const novel = getNovel(novelMatch[1]);
    if (novel) renderList(app, novel);
    else location.hash = '#/';
  } else {
    renderShelf(app);
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();