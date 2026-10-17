import page from './index.html'
import adaptive from './adaptive.html'
const server=Bun.serve({hostname:'127.0.0.1',port:3031,routes:{'/':page,'/adaptive':adaptive,'/results/contact-sheet.png':()=>new Response(Bun.file(import.meta.dir+'/results/comfy-adaptive-contact-sheet.png')),'/adaptive-assets.json':()=>new Response(Bun.file(import.meta.dir+'/adaptive-assets.json')),'/assets.json':()=>new Response(Bun.file(import.meta.dir+'/assets.json')),'/results/test-results.json':()=>new Response(Bun.file(import.meta.dir+'/results/test-results.json')),'/assets/:file':req=>new Response(Bun.file(import.meta.dir+'/assets/'+req.params.file))},development:true})
console.log('Comfy asset gallery: '+server.url)
