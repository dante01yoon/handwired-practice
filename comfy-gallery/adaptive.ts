import saved from '../lab/reusable-layout/model.json'
import {createRule} from '../lab/reusable-layout/model.ts'
import {prepareScene,wrapLayout,ordinaryPreferences,optimizeInstance,measureLayout,type Layout} from '../lab/reusable-layout/layout.ts'
const assets=await(await fetch('/adaptive-assets.json')).json()
const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d')!;ctx.font='14px Arial'
const measurements:Record<string,number>={};const measure=(text:string)=>measurements[text]??(measurements[text]=ctx.measureText(text).width)
const rule=createRule(saved.parameters),initial=Array.from(rule.source.subarray(0,121))
let width=620,priority=false,long=false,last:any
const longCaption='A cream insulated tumbler with a plain screw lid. This is the main product used in the final reveal, so keep the entire item visible and give the full product description enough room to read.'
function calculate(w=width,p=priority,l=long){
 const scene=prepareScene({width:w,items:assets.map((a:any,i:number)=>({id:i,readingOrder:i,photoIndex:i,caption:l&&i===0?longCaption:a.title+'. '+a.caption,aspectRatio:a.ratio,importance:(i===0&&p)? .95 : .25}))},measure)
 const search=optimizeInstance(scene)
 const layouts=[wrapLayout(scene,ordinaryPreferences(scene)),wrapLayout(scene,rule.preferences(scene)),search.layout]
 return {scene,layouts,metrics:layouts.map(x=>measureLayout(scene,x)),searchEvaluations:search.evaluations}
}
function draw(id:string,layout:Layout,w:number){
 const stage=document.querySelector<HTMLElement>('#'+id)!;stage.replaceChildren()
 const parent=stage.parentElement!,scale=Math.min((parent.clientWidth-12)/w,(parent.clientHeight-12)/layout.height)
 Object.assign(stage.style,{width:w+'px',height:layout.height+'px',transform:`translateX(${-w*scale/2}px) scale(${scale})`})
 for(const r of layout.items){
  const card=document.createElement('figure');card.className='card';card.dataset.hero=String(r.item.id===0);card.dataset.asset=String(r.item.id)
  Object.assign(card.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'})
  const img=document.createElement('img');img.src='/assets/'+assets[r.item.id].file;img.alt=assets[r.item.id].name;img.style.height=r.imageHeight+'px'
  const caption=document.createElement('figcaption');for(const line of r.lines){const span=document.createElement('span');span.textContent=line;caption.append(span)}
  card.append(img,caption);stage.append(card)
 }
}
function render(){
 last=calculate();draw('fixed',last.layouts[0],width);draw('learned',last.layouts[1],width)
 document.querySelector('#summary')!.textContent=`폭 ${width}px · 텀블러 중요도 ${priority?'0.95':'0.25'} · ${long?'긴 상품 설명':'짧은 설명'} · 계수 121개 그대로 재사용`
 const a=last.layouts[0].items[0],b=last.layouts[1].items[0]
 document.querySelector('#fixed-metrics')!.textContent=`텀블러 너비 ${a.width.toFixed(1)}px · 설명 ${a.lines.length}줄`
 document.querySelector('#learned-metrics')!.textContent=`텀블러 너비 ${b.width.toFixed(1)}px · 설명 ${b.lines.length}줄`
 document.querySelector('#rows')!.innerHTML=last.metrics.map((m:any,i:number)=>`<tr><td>${['224px 고정 배치','공유 학습 규칙','매 배치마다 탐색'][i]}</td><td>${m.preferenceLoss.toFixed(4)}</td><td>${6-m.missingContent} / 6</td><td>${m.textOverflow.toFixed(1)} / ${m.horizontalOverflow.toFixed(1)}px</td><td>${m.overlaps}</td></tr>`).join('')
 document.querySelector('#audit')!.textContent=JSON.stringify({width,priority,long,metrics:last.metrics,productWidths:[a.width,b.width],layouts:last.layouts,measurements})
}
document.querySelector<HTMLSelectElement>('#width')!.onchange=e=>{width=Number((e.target as HTMLSelectElement).value);render()}
document.querySelector<HTMLButtonElement>('#priority')!.onclick=()=>{priority=!priority;render()}
document.querySelector<HTMLButtonElement>('#caption')!.onclick=()=>{long=!long;render()}
document.querySelector<HTMLButtonElement>('#reset')!.onclick=()=>{priority=false;long=false;width=620;document.querySelector<HTMLSelectElement>('#width')!.value='620';render()}
document.querySelector<HTMLButtonElement>('#test')!.onclick=()=>{
 const rows=[];for(const w of [420,620,900,1180])for(const p of [false,true])for(const l of [false,true]){
  const r=calculate(w,p,l);rows.push({width:w,priority:p,long:l,metrics:r.metrics,productWidths:[r.layouts[0]!.items[0]!.width,r.layouts[1]!.items[0]!.width]})
 }
 const unchanged=initial.every((v,i)=>v===rule.source[i]);const failures=rows.flatMap(r=>r.metrics.filter(m=>m.missingContent||m.textOverflow>1e-5||m.horizontalOverflow>1e-5||m.overlaps))
 const report={status:failures.length||!unchanged?'FAIL':'PASS',conditions:rows.length,layouts:rows.length*3,cards:rows.length*3*6,parametersUnchanged:unchanged,methods:['fixed224','sharedRule','perLayoutSearch'],rows,measurements,savedModelSeed:saved.seed}
 const improved=rows.filter(r=>r.metrics[1].preferenceLoss<r.metrics[0].preferenceLoss).length
 document.querySelector('#report')!.textContent=`${report.status} · 16조건 / 48배치 / 288카드 · 누락·설명 넘침·가로 넘침·겹침 ${failures.length}건 · 계수 유지 ${unchanged?'확인':'실패'}\n고정 너비 대비 배치 점수 개선 ${improved}/16 · 낮은 중요도 + 긴 설명 4조건은 악화`
 document.querySelector('#audit')!.textContent=JSON.stringify(report)
}
document.querySelector<HTMLButtonElement>('#export')!.onclick=()=>{
 const data={width,priority,long,method:'sharedRule',items:last.layouts[1].items.map((r:any)=>({file:assets[r.item.id].file,left:r.left,top:r.top,width:r.width,height:r.height,imageHeight:r.imageHeight,lines:r.lines})),height:last.layouts[1].height}
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='comfy-adaptive-layout.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 document.querySelector('#report')!.textContent='현재 배치를 comfy-adaptive-layout.json 파일로 저장했습니다.'
}
render()

document.querySelector<HTMLButtonElement>('#export-png')!.onclick=async()=>{
 const layout=last.layouts[1] as Layout,output=document.createElement('canvas');output.width=width;output.height=Math.ceil(layout.height)
 const g=output.getContext('2d')!;g.fillStyle='#f4eee5';g.fillRect(0,0,output.width,output.height);g.font='14px Arial';g.textBaseline='top'
 for(const r of layout.items){
  const image=new Image();image.src='/assets/'+assets[r.item.id].file;await image.decode()
  g.fillStyle='white';g.fillRect(r.left,r.top,r.width,r.height)
  const scale=Math.min(r.width/image.width,r.imageHeight/image.height),iw=image.width*scale,ih=image.height*scale
  g.drawImage(image,r.left+(r.width-iw)/2,r.top+(r.imageHeight-ih)/2,iw,ih)
  g.fillStyle='#202321';r.lines.forEach((line,i)=>g.fillText(line,r.left,r.top+r.imageHeight+8+i*20))
 }
 const blob=await new Promise<Blob>(resolve=>output.toBlob(b=>resolve(b!),'image/png'))
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='comfy-adaptive-contact-sheet.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
 document.querySelector('#report')!.textContent=`PNG 저장 완료 · ${output.width} × ${output.height}px · 이미지 6개와 전체 설명 유지`
}
