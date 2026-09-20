
(function(){
'use strict';
const PUZZLE = [0, 2, 1, 6, 0, 7, 9, 3, 0, 0, 0, 6, 0, 0, 0, 7, 0, 0, 0, 0, 0, 4, 0, 3, 0, 0, 0, 0, 0, 0, 8, 0, 6, 0, 0, 0, 0, 5, 2, 0, 0, 0, 8, 1, 0, 0, 8, 9, 0, 0, 0, 3, 6, 0, 0, 1, 0, 5, 0, 2, 0, 8, 0, 5, 0, 0, 7, 0, 8, 0, 0, 2, 0, 0, 0, 3, 0, 1, 0, 0, 0];
const SOLUTION = [4, 2, 1, 6, 5, 7, 9, 3, 8, 8, 3, 6, 1, 2, 9, 7, 4, 5, 7, 9, 5, 4, 8, 3, 6, 2, 1, 3, 7, 4, 8, 1, 6, 2, 5, 9, 6, 5, 2, 9, 3, 4, 8, 1, 7, 1, 8, 9, 2, 7, 5, 3, 6, 4, 9, 1, 7, 5, 6, 2, 4, 8, 3, 5, 6, 3, 7, 4, 8, 1, 9, 2, 2, 4, 8, 3, 9, 1, 5, 7, 6];
const PUZZLE_NUM = 9;
const gridEl = document.getElementById('sudoku-grid');
const statusEl = document.getElementById('status');
const keypadEl = document.getElementById('keypad');
const timerEl = document.getElementById('timer');
const values = PUZZLE.slice(), undoStack=[];
let selected = PUZZLE.findIndex(v => v === 0); if(selected < 0) selected = 0;
let timerStarted=false, timerStopped=false, timerStartMs=null, timerInterval=null, finalElapsedMs=0;
const row=i=>Math.floor(i/9), col=i=>i%9, box=i=>Math.floor(row(i)/3)*3+Math.floor(col(i)/3), current=i=>values[i]||0;
function setStatus(text, cls=''){ statusEl.textContent=text; statusEl.className='status'+(cls?' '+cls:''); }
function formatElapsed(ms){ const totalSeconds=Math.floor(ms/1000), minutes=Math.floor(totalSeconds/60), seconds=totalSeconds%60; return String(minutes).padStart(2,'0')+':'+String(seconds).padStart(2,'0'); }
function updateTimerDisplay(){ if(!timerStarted){ timerEl.textContent='00:00'; return; } const elapsed=timerStopped?finalElapsedMs:(Date.now()-timerStartMs); timerEl.textContent=formatElapsed(elapsed); }
function startTimerIfNeeded(){ if(timerStarted) return; timerStarted=true; timerStartMs=Date.now(); updateTimerDisplay(); timerInterval=setInterval(updateTimerDisplay,250); }
function stopTimer(){ if(!timerStarted || timerStopped) return; finalElapsedMs=Date.now()-timerStartMs; timerStopped=true; clearInterval(timerInterval); timerInterval=null; updateTimerDisplay(); }
const isComplete=()=>values.every(v=>v>=1&&v<=9), isCorrect=()=>values.every((v,i)=>v===SOLUTION[i]);
function updateKeypad(){ const counts=Array(10).fill(0); values.forEach(v=>{ if(v>=1&&v<=9) counts[v]++; }); keypadEl.querySelectorAll('button[data-number]').forEach(btn=>{ const n=Number(btn.dataset.number); if(counts[n]>=9){ btn.textContent=' '; btn.disabled=true; btn.classList.add('hidden-digit'); } else { btn.textContent=String(n); btn.disabled=false; btn.classList.remove('hidden-digit'); } }); }
function build(){ gridEl.innerHTML=''; for(let i=0;i<81;i++){ const b=document.createElement('button'); b.type='button'; b.className='cell'; if(PUZZLE[i]) b.classList.add('given'); if(col(i)===2||col(i)===5) b.classList.add('box-right'); if(row(i)===2||row(i)===5) b.classList.add('box-bottom'); if(col(i)===8) b.classList.add('last-col'); if(row(i)===8) b.classList.add('last-row'); b.addEventListener('click',()=>{ selected=i; render(); }); gridEl.appendChild(b); } render(); updateTimerDisplay(); }
function clearWrongMarks(){ gridEl.querySelectorAll('.wrong').forEach(el=>el.classList.remove('wrong')); }
function celebrateIfSolved(){ if(isComplete()&&isCorrect()){ stopTimer(); setStatus('Congratulations! You solved Symmetrical Puzzle #'+String(PUZZLE_NUM).padStart(3,'0')+' in '+formatElapsed(finalElapsedMs)+'. 🎉','success'); return true; } return false; }
function render(){ updateKeypad(); for(let i=0;i<81;i++){ const b=gridEl.children[i], v=current(i); b.textContent=v?String(v):''; b.classList.remove('selected','peer','same-number'); } if(selected>=0){ const sv=current(selected), sr=row(selected), sc=col(selected), sb=box(selected); gridEl.children[selected].classList.add('selected'); for(let i=0;i<81;i++){ if(i===selected) continue; if(row(i)===sr||col(i)===sc||box(i)===sb) gridEl.children[i].classList.add('peer'); if(sv && current(i)===sv) gridEl.children[i].classList.add('same-number'); } } }
function enter(n){ if(timerStopped) return; if(PUZZLE[selected]){ setStatus('Original clue cells cannot be changed.'); return; } startTimerIfNeeded(); undoStack.push([selected, values[selected]]); values[selected]=Number(n); clearWrongMarks(); render(); if(!celebrateIfSolved()) setStatus('Number entered. Keep going!'); }
document.getElementById('erase-btn').onclick=()=>{ if(timerStopped) return; if(PUZZLE[selected]){ setStatus('Original clue cells cannot be erased.'); return; } undoStack.push([selected, values[selected]]); values[selected]=0; clearWrongMarks(); render(); setStatus('Cell cleared. The timer continues.'); };
document.getElementById('undo-btn').onclick=()=>{ if(timerStopped) return; const x=undoStack.pop(); if(x){ values[x[0]]=x[1]; selected=x[0]; clearWrongMarks(); render(); setStatus('Last move undone. The timer continues.'); } else setStatus('Nothing to undo.'); };
document.getElementById('check-btn').onclick=()=>{ const wrong=[]; for(let i=0;i<81;i++) if(values[i]&&values[i]!==SOLUTION[i]) wrong.push(i); clearWrongMarks(); if(wrong.length){ wrong.forEach(i=>gridEl.children[i].classList.add('wrong')); setStatus(String(wrong.length)+' incorrect entr'+(wrong.length===1?'y':'ies')+'. Highlighted cells can be corrected.','error'); return; } if(celebrateIfSolved()) return; setStatus('Everything entered so far is correct. Keep going!'); };
document.getElementById('reset-btn').onclick=()=>{ if(timerStopped) return; if(confirm('Clear all your entries and restart Puzzle #'+String(PUZZLE_NUM).padStart(3,'0')+'? The timer will NOT reset.')){ for(let i=0;i<81;i++) values[i]=PUZZLE[i]; undoStack.length=0; selected=PUZZLE.findIndex(v=>v===0); if(selected<0) selected=0; clearWrongMarks(); render(); if(timerStarted) setStatus('Puzzle reset. Your solving time continues.'); else setStatus('Puzzle reset. The timer will start with your first entered digit.'); } };
keypadEl.addEventListener('click',e=>{ const b=e.target.closest('button[data-number]'); if(b&&!b.disabled) enter(b.dataset.number); });
document.addEventListener('keydown',e=>{ if(/^[1-9]$/.test(e.key)){ const btn=keypadEl.querySelector('button[data-number="'+e.key+'"]'); if(btn&&!btn.disabled){ e.preventDefault(); enter(e.key); } } });
build();
})();
