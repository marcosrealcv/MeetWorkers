import 'dotenv/config';
import express from 'express';
import config_pipeline from './config_server_express/config_pipeline';

const app = express();
config_pipeline(app);

app.listen(3000,(error?:any)=>{

    if(error){
        console.log('Error al INICIAR servidor WEB EXPRESS en puerto 3000:', error);
    } else {
        console.log('...Servidor WEB EXPRESS iniciado en puerto 3000...');
    }
})