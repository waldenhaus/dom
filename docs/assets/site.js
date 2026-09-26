'use strict';
const roomButtons = [...document.querySelectorAll('[data-room]')];
roomButtons.forEach(button => button.addEventListener('click', () => {
  roomButtons.forEach(item => {
    const selected = item === button;
    item.classList.toggle('selected', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  document.querySelectorAll('[data-section]').forEach(section => {
    section.hidden = button.dataset.room !== 'all' && section.dataset.section !== button.dataset.room;
  });
}));

const viewer = document.querySelector('#viewer');
const zoomLinks = [...document.querySelectorAll('a.zoom')];
let current = 0;
let opener;
function showView(index) {
  const visible = zoomLinks.filter(link => !link.closest('[hidden]'));
  current = (index + visible.length) % visible.length;
  const link = visible[current];
  const image = document.querySelector('#viewer-image');
  image.src = link.href;
  image.alt = link.dataset.title;
  document.querySelector('#viewer-title').textContent = link.dataset.title;
  document.querySelector('#viewer-counter').textContent = `${current + 1} / ${visible.length}`;
  document.querySelector('#original-view').href = link.href;
}
zoomLinks.forEach(link => link.addEventListener('click', event => {
  if (!viewer || !viewer.showModal || event.ctrlKey || event.metaKey || event.shiftKey) return;
  event.preventDefault();
  opener = link;
  showView(zoomLinks.filter(item => !item.closest('[hidden]')).indexOf(link));
  viewer.showModal();
}));
document.querySelector('#close-viewer').addEventListener('click', () => viewer.close());
document.querySelector('#previous-view').addEventListener('click', () => showView(current - 1));
document.querySelector('#next-view').addEventListener('click', () => showView(current + 1));
viewer.addEventListener('close', () => opener?.focus());
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight') showView(current + 1);
  if (event.key === 'ArrowLeft') showView(current - 1);
});

const search = document.querySelector('#doc-search');
if (search) search.addEventListener('input', () => {
  const query = search.value.trim().toLocaleLowerCase('ru');
  let total = 0;
  document.querySelectorAll('.doc-group').forEach(group => {
    let found = 0;
    group.querySelectorAll('.doc-row').forEach(row => {
      row.hidden = !row.dataset.search.includes(query);
      if (!row.hidden) found++;
    });
    group.hidden = !found;
    group.open = Boolean(query && found);
    total += found;
  });
  document.querySelector('#search-status').textContent = query ? `Найдено файлов: ${total}` : '';
});

// Read-only filter for the published quantity snapshot.
(() => {
  const search = document.getElementById('q-search');
  const filter = document.getElementById('q-filter');
  if (!search || !filter) return;
  const rows = [...document.querySelectorAll('[data-q-row]')];
  const count = document.getElementById('q-count');
  const normalize = value => value.toLocaleLowerCase('ru').replaceAll('ё', 'е').trim();
  const update = () => {
    const query = normalize(search.value);
    let visible = 0;
    rows.forEach(row => {
      const selected = filter.value === 'all' || (filter.value === 'pending' ? row.dataset.pending === 'true' : row.dataset.category === filter.value);
      row.hidden = !selected || !normalize(row.dataset.search).includes(query);
      if (!row.hidden) visible += 1;
    });
    count.textContent = `Показано ${visible} из ${rows.length}`;
  };
  search.addEventListener('input', update);
  filter.addEventListener('change', update);
  update();
})();
