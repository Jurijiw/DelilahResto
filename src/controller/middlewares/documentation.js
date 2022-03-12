const  yaml  =  require ('js-yaml');
const fs = require('fs');
const swaggerUI = require('swagger-ui-express');

function loadDocumentation(server){
    try { 
        const doc = yaml.load (fs.readFileSync('./src/controller/middlewares/spec.yml','utf8')) ; 
        server.use('/api/v2/api-docs', swaggerUI.serve, swaggerUI.setup(doc));
    } catch (e){ 
        console.log (e) ; 
    }
}

module.exports = {
    loadDocumentation
}