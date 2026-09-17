
(function () {
  'use strict';

  const PUZZLE = [5, 0, 0, 3, 2, 0, 0, 0, 0, 0, 7, 4, 0, 0, 0, 2, 0, 6, 0, 0, 9, 0, 0, 7, 0, 3, 0, 0, 5, 7, 9, 0, 0, 0, 0, 2, 2, 0, 0, 0, 1, 0, 0, 0, 7, 1, 0, 0, 0, 0, 2, 3, 6, 0, 0, 3, 0, 6, 0, 0, 1, 0, 0, 9, 0, 2, 0, 0, 0, 6, 4, 0, 0, 0, 0, 0, 9, 1, 0, 0, 3];
  const SOLUTION = [5, 8, 1, 3, 2, 6, 9, 7, 4, 3, 7, 4, 1, 5, 9, 2, 8, 6, 6, 2, 9, 8, 4, 7, 5, 3, 1, 4, 5, 7, 9, 6, 3, 8, 1, 2, 2, 6, 3, 5, 1, 8, 4, 9, 7, 1, 9, 8, 4, 7, 2, 3, 6, 5, 7, 3, 5, 6, 8, 4, 1, 2, 9, 9, 1, 2, 7, 3, 5, 6, 4, 8, 8, 4, 6, 2, 9, 1, 7, 5, 3];

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
  let selected = 0;

  function rowOf(index) { return Math.floor(index / 9); }
  function colOf(index) { return index % 9; }
  function boxOf(index) {
    return Math.floor(rowOf(index) / 3) * 3 + Math.floor(colOf(index) / 3);
  }

  function currentValue(index) {
    return values[index] || 0;
  }

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
      if (PUZZLE[i] !== 0) cell.classList.add('given');
      cell.dataset.index = String(i);
      cell.setAttribute('role', 'gridcell');

      if (col === 2 || col === 5) cell.classList.add('box-right');
      if (row === 2 || row === 5) cell.classList.add('box-bottom');
      if (col === 8) cell.classList.add('last-col');
      if (row === 8) cell.classList.add('last-row');

      cell.addEventListener('click', () => selectCell(i));
      gridEl.appendChild(cell);
    }
    render();
    selectCell(PUZZLE.findIndex(v => v === 0) !== -1 ? PUZZLE.findIndex(v => v === 0) : 0);
  }

  function selectCell(index) {
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
    if (selected < 0) return;
    if (PUZZLE[selected] !== 0) {
      const value = PUZZLE[selected];
      setStatus(`This is a clue cell and cannot be changed. Matching digit ${value} is highlighted.`);
      render();
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
  }

  function eraseSelected() {
    if (selected < 0) return;
    if (PUZZLE[selected] !== 0) {
      setStatus('Original clues cannot be erased.');
      return;
    }
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

  function moveSelection(deltaRow, deltaCol) {
    let r = rowOf(selected);
    let c = colOf(selected);
    r = (r + deltaRow + 9) % 9;
    c = (c + deltaCol + 9) % 9;
    selectCell(r * 9 + c);
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
      setStatus('Congratulations! You solved Symmetrical Puzzle #004 correctly. 🎉', 'success');
    }
  }

  function resetPuzzle() {
    const hasProgress = values.some((v, i) => PUZZLE[i] === 0 && v !== 0);
    if (hasProgress && !window.confirm('Clear all your entries and restart Puzzle #004?')) return;

    for (let i = 0; i < 81; i++) values[i] = PUZZLE[i];
    undoStack.length = 0;
    clearWrongMarks();
    setStatus('Puzzle reset. Tap or click any cell to begin.');
    render();
    selectCell(PUZZLE.findIndex(v => v === 0) !== -1 ? PUZZLE.findIndex(v => v === 0) : 0);
  }

  function render() {
    for (let i = 0; i < 81; i++) {
      const cell = gridEl.children[i];
      if (!cell) continue;

      const value = currentValue(i);
      cell.textContent = value === 0 ? '' : String(value);
      cell.classList.remove('selected', 'peer', 'same-number');

      const row = rowOf(i);
      const col = colOf(i);
      const ariaValue = value === 0 ? 'empty' : (PUZZLE[i] !== 0 ? 'clue ' + value : 'entered ' + value);
      cell.setAttribute('aria-label', `Row ${row + 1}, column ${col + 1}, ${ariaValue}`);
    }

    if (selected >= 0) {
      const selectedCell = gridEl.children[selected];
      if (selectedCell) selectedCell.classList.add('selected');

      const selectedValue = currentValue(selected);
      const selectedRow = rowOf(selected);
      const selectedCol = colOf(selected);
      const selectedBox = boxOf(selected);

      for (let i = 0; i < 81; i++) {
        if (i !== selected) {
          if (rowOf(i) === selectedRow || colOf(i) === selectedCol || boxOf(i) === selectedBox) {
            gridEl.children[i].classList.add('peer');
          }
          if (selectedValue !== 0 && currentValue(i) === selectedValue) {
            gridEl.children[i].classList.add('same-number');
          }
        }
      }

      if (selectedValue !== 0) {
        setStatus(`Digit ${selectedValue} selected. Matching digits are highlighted.`);
      } else {
        setStatus('Empty cell selected. Row, column, and 3×3 box are highlighted.');
      }
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
