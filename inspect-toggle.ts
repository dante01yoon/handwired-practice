import {buildToggle, createToggleMachine} from './template/toggle.ts'
const built = buildToggle()
const program = built.circuit.compileTensorProgram([...built.nextSource, ...Object.values(built.output)])
console.log('Toggle compiled program')
console.log(JSON.stringify({sourceCells:program.sourceSize,liveOperations:program.valueCount-program.sourceSize,layers:program.layers.length},null,2))
console.log('\nREADME integer example')
for (const a of [3,4,5,6,4.5]) {
  const bit = Math.max(0,a-4)-Math.max(0,a-5)
  console.log(`a=${a}: selector=${bit}, arithmetic=${bit*10+(1-bit)*12}, JS=${a>4?10:12}`)
}
const machine = createToggleMachine()
machine.queue({kind:'down',x:640.001,y:400,timeStamp:1000})
try {machine.step(1280,800,1016)} catch(error) {console.log('\nDeclared-grid guard:',String(error))}
