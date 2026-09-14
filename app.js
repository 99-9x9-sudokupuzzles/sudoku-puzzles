(function () {
  'use strict';

  const PUZZLE = [
    0,8,1,3,0,0,0,0,9,
    0,0,0,0,0,1,0,3,5,
    5,3,0,6,0,0,0,0,0,
    0,0,9,0,6,0,7,5,3,
    6,0,0,8,0,3,0,0,4,
    1,4,3,0,7,0,6,0,0,
    0,0,0,0,0,2,0,7,6,
    7,6,0,5,0,0,0,0,0,
    4,0,0,0,0,6,5,2,0
  ];

  const SOLUTION = [
    2,8,1,3,5,7,4,6,9,
    9,7,6,2,4,1,8,3,5,
    5,3,4,6,9,8,2,1,7,
    8,2,9,1,6,4,7,5,3,
    6,5,7,8,2,3,1,9,4,
    1,4,3,9,7,5,6,8,2,
    3,1,5,4,8,2,9,7,6,
    7,6,2,5,1,9,3,4,8,
    4,9,8,7,3,6,5,2,1
  ];

  function isComplete(values) {
    return values.every(v => Number(v) >= 1 && Number(v) <= 9);
  }

  function isCorrect(values) {
    return values.length === 81 && values.every((v, i) => Number(v) === SOLUTION[i]);
  }

  function getWrongCells(values) {
    const wrong = [];
    values.forEach((v, i) => {
      if (Number(v) !== 0 && Number(v) !== SOLUTION[i]) wrong.push(i);
    });
    return wrong;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PUZZLE, SOLUTION, isComplete, isCorrect, getWrongCells };
  }

  if (typeof document === 'undefined') return;

  const gridEl = document.getElementById('sudoku-grid');
  const statusEl = document.getElementById('status');
  const eraseBtn = document.getElementById('erase-btn');
  const undoBtn = document.getElementById('undo-btn');
  const checkBtn = document.getElementById('check-btn');
  const resetBtn = document.getElementById('reset-btn');
  const keypad = document.querySelector('.keypad');

  const values = PUZZLE.slice();
  const undoStack = [];
  let selected = PUZZLE.findIndex(v => v === 0);

  function rowOf(index) { return Math.floor(index / 9); }
  function colOf(index) { return index % 9; }

  function setStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = 'status' + (type ? ' ' + type : '');
  }

  function buildGrid() {
    gridEl.innerHTML = '';
    for (let i = 0; i < 81; i++) {
      const row = rowOf(i);
      const col = colOf(i);
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.className = 'cell';
      cell.dataset.index = String(i);
      cell.setAttribute('role', 'gridcell');

      if (PUZZLE[i] !== 0) {
        cell.classList.add('given');
        cell.disabled = true;
        cell.textContent = String(PUZZLE[i]);
        cell.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}, clue ${PUZZLE[i]}`);
      } else {
        cell.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}, empty`);
        cell.addEventListener('click', () => selectCell(i));
      }

      if (col === 2 || col === 5) cell.classList.add('box-right');
      if (row === 2 || row === 5) cell.classList.add('box-bottom');
      if (col === 8) cell.classList.add('last-col');
      if (row === 8) cell.classList.add('last-row');

      gridEl.appendChild(cell);
    }
    render();
  }

  function selectCell(index) {
    if (PUZZLE[index] !== 0) return;
    selected = index;
    render();
    const cell = gridEl.children[index];
    if (cell) cell.focus({ preventScroll: true });
  }

  function pushUndo(index, previous) {
    undoStack.push({ index, previous });
    if (undoStack.length > 200) undoStack.shift();
  }

  function enterNumber(number) {
    if (selected < 0 || PUZZLE[selected] !== 0) {
      setStatus('Select an empty cell first.');
      return;
    }
    const next = Number(number);
    if (next < 1 || next > 9) return;

    if (values[selected] !== next) {
      pushUndo(selected, values[selected]);
      values[selected] = next;
    }

    clearWrongMarks();
    setStatus('Number entered. Continue solving, or press Check when ready.');
    render();
    moveToNextEmpty();
  }

  function eraseSelected() {
    if (selected < 0 || PUZZLE[selected] !== 0) return;
    if (values[selected] !== 0) {
      pushUndo(selected, values[selected]);
      values[selected] = 0;
    }
    clearWrongMarks();
    setStatus('Cell cleared.');
    render();
  }

  function undo() {
    const change = undoStack.pop();
    if (!change) {
      setStatus('Nothing to undo.');
      return;
    }
    values[change.index] = change.previous;
    selected = change.index;
    clearWrongMarks();
    setStatus('Last move undone.');
    render();
  }

  function moveSelection(deltaRow, deltaCol) {
    if (selected < 0) selected = 0;
    let r = rowOf(selected);
    let c = colOf(selected);

    for (let attempts = 0; attempts < 81; attempts++) {
      r = (r + deltaRow + 9) % 9;
      c = (c + deltaCol + 9) % 9;
      const idx = r * 9 + c;
      if (PUZZLE[idx] === 0) {
        selectCell(idx);
        return;
      }
    }
  }

  function moveToNextEmpty() {
    if (selected < 0) return;
    for (let step = 1; step <= 81; step++) {
      const idx = (selected + step) % 81;
      if (PUZZLE[idx] === 0 && values[idx] === 0) {
        selected = idx;
        render();
        return;
      }
    }
  }

  function clearWrongMarks() {
    gridEl.querySelectorAll('.wrong').forEach(el => el.classList.remove('wrong'));
  }

  function markWrongCells(indices) {
    clearWrongMarks();
    indices.forEach(i => {
      const cell = gridEl.children[i];
      if (cell) cell.classList.add('wrong');
    });
  }

  function checkPuzzle() {
    const wrong = getWrongCells(values);
    if (wrong.length > 0) {
      markWrongCells(wrong);
      setStatus(`${wrong.length} ${wrong.length === 1 ? 'entry is' : 'entries are'} incorrect. Highlighted cells can be corrected.`, 'error');
      return;
    }

    if (!isComplete(values)) {
      const blanks = values.filter(v => v === 0).length;
      setStatus(`Everything entered so far is correct. ${blanks} ${blanks === 1 ? 'cell remains' : 'cells remain'}.`);
      return;
    }

    if (isCorrect(values)) {
      clearWrongMarks();
      setStatus('Congratulations! You solved Symmetrical Puzzle #002 correctly. 🎉', 'success');
    }
  }

  function resetPuzzle() {
    const hasProgress = values.some((v, i) => PUZZLE[i] === 0 && v !== 0);
    if (hasProgress && !window.confirm('Clear all your entries and restart Puzzle #002?')) return;

    for (let i = 0; i < 81; i++) values[i] = PUZZLE[i];
    undoStack.length = 0;
    selected = PUZZLE.findIndex(v => v === 0);
    clearWrongMarks();
    setStatus('Puzzle reset. Select an empty cell to begin.');
    render();
  }

  function render() {
    for (let i = 0; i < 81; i++) {
      const cell = gridEl.children[i];
      if (!cell) continue;

      if (PUZZLE[i] === 0) {
        cell.textContent = values[i] === 0 ? '' : String(values[i]);
        cell.setAttribute(
          'aria-label',
          `Row ${rowOf(i) + 1}, column ${colOf(i) + 1}, ${values[i] === 0 ? 'empty' : 'entered ' + values[i]}`
        );
      }

      cell.classList.toggle('selected', i === selected && PUZZLE[i] === 0);
    }
  }

  keypad.addEventListener('click', (event) => {
    const button = event.target.closest('[data-number]');
    if (button) enterNumber(button.dataset.number);
  });

  eraseBtn.addEventListener('click', eraseSelected);
  undoBtn.addEventListener('click', undo);
  checkBtn.addEventListener('click', checkPuzzle);
  resetBtn.addEventListener('click', resetPuzzle);

  document.addEventListener('keydown', (event) => {
    if (/^[1-9]$/.test(event.key)) {
      event.preventDefault();
      enterNumber(event.key);
      return;
    }

    if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
      event.preventDefault();
      eraseSelected();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      undo();
      return;
    }

    const arrows = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1]
    };
    if (arrows[event.key]) {
      event.preventDefault();
      moveSelection(...arrows[event.key]);
    }
  });

  buildGrid();
}());
