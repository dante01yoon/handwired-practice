import {buildGallery,reference} from './program.ts'
import {mkdirSync,writeFileSync} from 'node:fs'
const engine=buildGallery();let cases=0,values=0,maxError=0;const failures:any[]=[]
// Layouts, filters, each card centre, stage exterior, and points on either
// side of each border. Exact bits and <0.001px geometry are checked separately.
for(const width of [600,768,960,1200])for(const gap of [8,16,32])for(const columns of [2,3])for(const filter of [0,1,2]){
 const rects=reference(width,gap,columns,filter)
 const points:[[number,number]]|[number,number][]=[[0,0],[width,790]]
 for(const r of rects){
  const q=(v:number)=>Math.round(v*64)/64
  points.push([q(r.left+r.width/2),q(r.top+r.height/2)],[q(r.left),q(r.top+1)],[q(r.left)-1/64,q(r.top+1)],[q(r.left+r.width)-1/64,q(r.top+1)],[q(r.left+r.width)+1/64,q(r.top+1)])
 }
 for(const [x,y]of points){
  const actual=engine.run(width,gap,columns,filter,x,y),expected=reference(width,gap,columns,filter,x,y);cases++
  for(let i=0;i<6;i++)for(const key of ['left','top','width','height','visible','hit']as const){
   const error=Math.abs(actual[i]![key]-expected[i]![key]);values++;if(key!=='hit'&&key!=='visible')maxError=Math.max(maxError,error)
   if(error>(key==='hit'||key==='visible'?0:.001))failures.push({width,gap,columns,filter,x,y,i,key,actual:actual[i]![key],expected:expected[i]![key]})
  }
 }
}
const report={status:failures.length?'FAIL':'PASS',cases,values,maxGeometryErrorPx:maxError,geometryTolerancePx:.001,hitAndFilter:'exact',...engine.stats,failures:failures.slice(0,10)}
mkdirSync('results',{recursive:true});writeFileSync('results/test-results.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(failures.length)process.exit(1)
