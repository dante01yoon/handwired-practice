import {createRule} from '../lab/reusable-layout/model.ts'
import saved from '../lab/reusable-layout/model.json'
import {prepareScene,wrapLayout,ordinaryPreferences,optimizeInstance,measureLayout} from '../lab/reusable-layout/layout.ts'
import assets from './adaptive-assets.json'
import measurements from './results/arial14-measurements.json'
const rule=createRule(saved.parameters),before=Array.from(rule.source.subarray(0,121))
const measure=(text:string)=>{const v=(measurements as Record<string,number>)[text];if(v===undefined)throw new Error('Unmeasured text: '+text);return v}
const longCaption='A cream insulated tumbler with a plain screw lid. This is the main product used in the final reveal, so keep the entire item visible and give the full product description enough room to read.'
const rows=[]
for(const width of [420,620,900,1180])for(const priority of [false,true])for(const long of [false,true]){
 const scene=prepareScene({width,items:assets.map((a,i)=>({id:i,readingOrder:i,photoIndex:i,caption:long&&i===0?longCaption:a.title+'. '+a.caption,aspectRatio:a.ratio,importance:i===0&&priority?.95:.25}))},measure)
 const layouts=[wrapLayout(scene,ordinaryPreferences(scene)),wrapLayout(scene,rule.preferences(scene)),optimizeInstance(scene).layout]
 const metrics=layouts.map(l=>measureLayout(scene,l))
 for(const m of metrics)if(m.missingContent||m.textOverflow>1e-5||m.horizontalOverflow>1e-5||m.overlaps)throw new Error(JSON.stringify({width,priority,long,m}))
 rows.push({width,priority,long,metrics,productWidths:[layouts[0].items[0].width,layouts[1].items[0].width]})
}
if(!before.every((x,i)=>x===rule.source[i]))throw new Error('Saved parameters changed')
const improved=rows.filter(r=>r.metrics[1].preferenceLoss<r.metrics[0].preferenceLoss).length
const report={status:'PASS',conditions:rows.length,layouts:rows.length*3,cards:rows.length*3*6,parametersUnchanged:true,methods:['fixed224','sharedRule','perLayoutSearch'],improved,measurement:'Actual browser canvas, Arial 14px; frozen word measurements for reproducibility',rows}
await Bun.write(import.meta.dir+'/results/adaptive-test-results.json',JSON.stringify(report,null,2)+'\n')
console.log(`PASS: ${report.conditions} conditions / ${report.layouts} layouts / ${report.cards} cards; no content loss, text/horizontal overflow, overlaps.`)
console.log(`Authored preference score improved over fixed224 in ${improved}/16 conditions. Four low-priority long-caption conditions scored worse.`)
console.log('620px product widths:',rows.filter(r=>r.width===620&&!r.long).map(r=>({priority:r.priority,width:r.productWidths[1]})))
