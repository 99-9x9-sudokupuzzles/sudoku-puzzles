
(function(){
'use strict';
const PUZZLE=[0, 0, 0, 4, 0, 0, 1, 7, 0, 0, 4, 5, 0, 8, 1, 0, 0, 9, 0, 0, 1, 0, 0, 9, 0, 0, 4, 1, 8, 4, 0, 3, 0, 0, 0, 0, 0, 0, 0, 8, 0, 5, 0, 0, 0, 0, 0, 0, 0, 2, 0, 8, 4, 3, 5, 0, 0, 6, 0, 0, 3, 0, 0, 4, 0, 0, 5, 9, 0, 2, 8, 0, 0, 9, 6, 0, 0, 8, 0, 0, 0];
const SOLUTION=[9, 6, 3, 4, 5, 2, 1, 7, 8, 2, 4, 5, 7, 8, 1, 6, 3, 9, 8, 7, 1, 3, 6, 9, 5, 2, 4, 1, 8, 4, 9, 3, 6, 7, 5, 2, 7, 3, 2, 8, 4, 5, 9, 6, 1, 6, 5, 9, 1, 2, 7, 8, 4, 3, 5, 2, 8, 6, 1, 4, 3, 9, 7, 4, 1, 7, 5, 9, 3, 2, 8, 6, 3, 9, 6, 2, 7, 8, 4, 1, 5];
const gridEl=document.getElementById('sudoku-grid'),statusEl=document.getElementById('status');
const values=PUZZLE.slice(),undoStack=[];let selected=PUZZLE.findIndex(v=>v===0);
const row=i=>Math.floor(i/9),col=i=>i%9,box=i=>Math.floor(row(i)/3)*3+Math.floor(col(i)/3);
function current(i){return values[i]||0}
function setStatus(t){statusEl.textContent=t}
function build(){
 gridEl.innerHTML='';
 for(let i=0;i<81;i++){
  const b=document.createElement('button');b.type='button';b.className='cell';if(PUZZLE[i])b.classList.add('given');
  if(col(i)===2||col(i)===5)b.classList.add('box-right');if(row(i)===2||row(i)===5)b.classList.add('box-bottom');if(col(i)===8)b.classList.add('last-col');if(row(i)===8)b.classList.add('last-row');
  b.addEventListener('click',()=>{selected=i;render();});gridEl.appendChild(b);
 } render();
}
function render(){
 for(let i=0;i<81;i++){
  const b=gridEl.children[i],v=current(i);b.textContent=v?String(v):'';b.classList.remove('selected','peer','same-number','wrong');
 }
 if(selected>=0){
  const sv=current(selected),sr=row(selected),sc=col(selected),sb=box(selected);gridEl.children[selected].classList.add('selected');
  for(let i=0;i<81;i++)if(i!==selected){
   if(row(i)===sr||col(i)===sc||box(i)===sb)gridEl.children[i].classList.add('peer');
   if(sv&&current(i)===sv)gridEl.children[i].classList.add('same-number');
  }
  setStatus(sv?`Digit ${sv} selected. Matching digits are highlighted.`:'Empty cell selected. Row, column, and 3×3 box are highlighted.');
 }
}
function enter(n){
 if(PUZZLE[selected]){setStatus('Original clue cells cannot be changed.');return}
 undoStack.push([selected,values[selected]]);values[selected]=Number(n);render();
}
document.querySelector('.keypad').addEventListener('click',e=>{const b=e.target.closest('[data-number]');if(b)enter(b.dataset.number)});
document.getElementById('erase-btn').onclick=()=>{if(!PUZZLE[selected]){undoStack.push([selected,values[selected]]);values[selected]=0;render()}};
document.getElementById('undo-btn').onclick=()=>{const x=undoStack.pop();if(x){values[x[0]]=x[1];selected=x[0];render()}else setStatus('Nothing to undo.')};
document.getElementById('check-btn').onclick=()=>{
 const wrong=[];for(let i=0;i<81;i++)if(values[i]&&values[i]!==SOLUTION[i])wrong.push(i);
 if(wrong.length){wrong.forEach(i=>gridEl.children[i].classList.add('wrong'));setStatus(`${wrong.length} incorrect entr${wrong.length===1?'y':'ies'}.`);return}
 if(values.some(v=>v===0)){setStatus('Everything entered so far is correct. Keep going!');return}
 setStatus('Congratulations! You solved Symmetrical Puzzle #005 correctly. 🎉');
};
document.getElementById('reset-btn').onclick=()=>{if(confirm('Clear all your entries and restart Puzzle #005?')){for(let i=0;i<81;i++)values[i]=PUZZLE[i];undoStack.length=0;selected=PUZZLE.findIndex(v=>v===0);render();}};
build();
}());
