// Client-side board storage (localStorage). Per-browser only — cloud sync
// arrives with user accounts.
const KEY = "onesearch_boards";

export function getBoards() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function persist(boards) {
  try {
    localStorage.setItem(KEY, JSON.stringify(boards));
  } catch {}
}

export function getBoardNames() {
  return Object.keys(getBoards());
}

export function addToBoard(name, img) {
  const boards = getBoards();
  const list = boards[name] || [];
  if (!list.some((i) => i.id === img.id)) list.push(img);
  boards[name] = list;
  persist(boards);
}

export function removeFromBoard(name, imgId) {
  const boards = getBoards();
  if (!boards[name]) return;
  boards[name] = boards[name].filter((i) => i.id !== imgId);
  if (boards[name].length === 0) delete boards[name];
  persist(boards);
}

export function deleteBoard(name) {
  const boards = getBoards();
  delete boards[name];
  persist(boards);
}

export const FAV_BOARD = "Favourites";

export function isFavorite(imgId) {
  return (getBoards()[FAV_BOARD] || []).some((i) => i.id === imgId);
}

export function toggleFavorite(img) {
  if (isFavorite(img.id)) {
    removeFromBoard(FAV_BOARD, img.id);
    return false;
  }
  addToBoard(FAV_BOARD, img);
  return true;
}
