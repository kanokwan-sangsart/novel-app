import { renderList } from './list.js';
import { renderEditor } from './editor.js';

const app = document.getElementById('app');
let cleanup = null;

function route() {
  if (cleanup) {
    cleanup();
    cleanup = null;
  }

  const hash = location.hash || '#/';
  const match = hash.match(/^#\/chapter\/(.+)$/);

  if (match) {
    cleanup = renderEditor(app, match[1]);
  } else {
    renderList(app);
  }
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);
route();