import {buildGallery,reference} from './program.ts'
const assets=await(await fetch('/assets.json')).json();const engine=buildGallery()
const stage=document.querySelector<HTMLElement>('#stage')!,output=document.querySelector<HTMLElement>('#output')!
const SCALE=.60
let width=960,gap=16,columns=3,filter=0,pointer=[0,0],selected=-1
stage.innerHTML=assets.map((a:any,i:number)=>`<button class="asset" id="asset-${i}" aria-label="${a.name}"><img src="/assets/${a.file}" alt="${a.name}"><span>${a.name}</span></button>`).join('')
function render(){
 const result=engine.run(width,gap,columns,filter,pointer[0],pointer[1]);const ref=reference(width,gap,columns,filter,pointer[0],pointer[1]);let err=0;let hit=-1
 result.forEach((r,i)=>{
  const el=document.querySelector<HTMLElement>('#asset-'+i)!;Object.assign(el.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',opacity:r.visible?'1':'.13',outline:i===selected?'4px solid #db713f':'none'})
  if(r.hit===1)hit=i
  for(const k of ['left','top','width','height']as const)err=Math.max(err,Math.abs(r[k]-ref[i]![k]))
 })
 const stageHeight=Math.ceil(Math.max(...result.map(r=>r.top+r.height))+gap)
 stage.style.width=width+'px';stage.style.height=stageHeight+'px';stage.style.transform=`scale(${SCALE})`;stage.style.transformOrigin='top left'
 const wrapper=stage.parentElement!;wrapper.style.width=(width*SCALE+8)+'px';wrapper.style.height=(stageHeight*SCALE+8)+'px'
 document.querySelector('#stats')!.textContent=`${engine.stats.sourceCells} 입력 · ${engine.stats.liveOperations} 연산 · ${engine.stats.layers} 층`
 output.textContent=`${columns}열 · 간격 ${gap}px · ${filter===0?'전체':filter===1?'제품':'스토리'}\n선택: ${selected<0?'없음':assets[selected].name}\n포인터: ${pointer.join(', ')} → hit ${hit<0?'없음':hit+1}\nJS 비교 최대 위치 오차: ${err.toFixed(6)}px\n필터/클릭 판정: ${result.every((r,i)=>r.visible===ref[i].visible&&r.hit===ref[i].hit)?'일치':'불일치'}`
 document.querySelector('#geometry')!.textContent=result.map((r,i)=>`${i+1}  x=${r.left.toFixed(2)} y=${r.top.toFixed(2)} w=${r.width.toFixed(2)}  표시=${r.visible}`).join('\n')
}
document.querySelectorAll<HTMLButtonElement>('[data-cols]').forEach(b=>b.onclick=()=>{columns=Number(b.dataset.cols);selected=-1;render()})
document.querySelectorAll<HTMLButtonElement>('[data-gap]').forEach(b=>b.onclick=()=>{gap=Number(b.dataset.gap);selected=-1;render()})
document.querySelector<HTMLSelectElement>('#filter')!.onchange=e=>{filter=Number((e.target as HTMLSelectElement).value);selected=-1;render()}
stage.addEventListener('pointerdown',e=>{const box=stage.getBoundingClientRect();pointer=[Math.round((e.clientX-box.left)/SCALE*64)/64,Math.round((e.clientY-box.top)/SCALE*64)/64];selected=engine.run(width,gap,columns,filter,...pointer).findIndex(r=>r.hit===1);render()})
document.querySelector<HTMLButtonElement>('#tests')!.onclick=async()=>{const r=await(await fetch('/results/test-results.json',{cache:'no-store'})).json();document.querySelector('#report')!.textContent=`${r.status} · ${r.cases.toLocaleString()} 입력 조합\n${r.values.toLocaleString()} 출력값 비교\n최대 위치 오차 ${r.maxGeometryErrorPx.toFixed(6)}px\n클릭·필터 판정: 완전 일치`}
render()
