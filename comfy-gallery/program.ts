import {createSourceTable,createEvaluator,input,inputBit} from '../src/runtime/cells.ts'
import {emitCompare,emitSelect,type Wire} from '../src/runtime/numeric-ui-core.ts'

// Six retained Comfy Cloud film assets. All rectangles/filter bits/hit bits
// below are evaluated by the compiled Handwired program, then painted by DOM.
export const kinds=[1,2,2,2,2,2]
export function buildGallery(){
 const table=createSourceTable()
 const cells=table.declare({width:input([600,1200],{initial:960,grid:1}),gap:input([8,32],{initial:16,grid:1}),three:inputBit(),filter:input([0,2],{grid:1}),x:input([0,1200],{grid:1/64}),y:input([0,2000],{grid:1/64})})
 const c=table.createCircuit()
 const all=(...bits:Wire[])=>c.reglu([],1,bits.map(b=>[b,1] as const),1-bits.length)
 const widths=[c.affine([[cells.width,.5],[cells.gap,-1.5]]),c.affine([[cells.width,1/3],[cells.gap,-4/3]])]
 const cardWidth=emitSelect(c,cells.three,widths[0]!,widths[1]!)
 const cardHeight=c.affine([[cardWidth,.5625]],36)
 const stepX=c.affine([[cardWidth,1],[cells.gap,1]])
 const stepY=c.affine([[cardHeight,1],[cells.gap,1]])
 const output=kinds.map((kind,i)=>{
  const left2=c.affine([[cells.gap,1],[stepX,i%2]])
  const left3=c.affine([[cells.gap,1],[stepX,i%3]])
  const top2=c.affine([[cells.gap,1],[stepY,Math.floor(i/2)]])
  const top3=c.affine([[cells.gap,1],[stepY,Math.floor(i/3)]])
  const left=emitSelect(c,cells.three,left2,left3),top=emitSelect(c,cells.three,top2,top3)
  const filterOff=emitCompare(c,cells.filter,'===',c.constant(0))
  const match=emitCompare(c,cells.filter,'===',c.constant(kind))
  const visible=c.affine([[all(c.affine([[filterOff,-1]],1),c.affine([[match,-1]],1)),-1]],1)
  const hit=all(visible,emitCompare(c,cells.x,'>=',left),emitCompare(c,cells.x,'<',c.affine([[left,1],[cardWidth,1]])),emitCompare(c,cells.y,'>=',top),emitCompare(c,cells.y,'<',c.affine([[top,1],[cardHeight,1]])))
  return {left,top,width:cardWidth,height:cardHeight,visible,hit}
 })
 const built={cells,output,...table.finish()}
 const compiled=c.compileTensorProgram([...built.nextSource,...output.flatMap(Object.values)])
 const evaluate=createEvaluator(built)
 return {built,stats:{sourceCells:compiled.sourceSize,liveOperations:compiled.valueCount-compiled.sourceSize,layers:compiled.layers.length},run(width:number,gap:number,columns:number,filter:number,x=0,y=0){
  const source=new Float32Array(built.initialSource)
  const values={width,gap,three:columns===3?1:0,filter,x,y}
  for(const [name,value]of Object.entries(values))source[cells[name as keyof typeof cells]]=value
  return evaluate(source).output.map(r=>({...r}))
 }}
}
export function reference(width:number,gap:number,columns:number,filter:number,x=0,y=0){
 const w=(width-(columns+1)*gap)/columns,h=w*9/16+36
 return kinds.map((kind,i)=>{
  const left=gap+(i%columns)*(w+gap),top=gap+Math.floor(i/columns)*(h+gap)
  const visible=filter===0||filter===kind?1:0
  return {left,top,width:w,height:h,visible,hit:visible&&x>=left&&x<left+w&&y>=top&&y<top+h?1:0}
 })
}
