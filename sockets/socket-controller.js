
const {Socket} =require('socket.io');
const {comprobarJWT} = require('../helpers')
const {ChatMensajes} =require('../models/')
const chatMensajes = new ChatMensajes();


//io es todo el servidor de sockets
const SocketController = async(socket=new Socket(),io) => {

    const token =socket.handshake.headers['x-token'];
   const usuario= await comprobarJWT(token);
   if(!usuario){
       return socket.disconnect();
   }
   //agregar el usuario conectado
   chatMensajes.agregarUsuario(usuario);
   io.emit('usuarios-activos',chatMensajes.usuariosArr)
   socket.emit('recibir-mensajes',chatMensajes.ultimosDiez);
   
   //conectarlo a un sala especial

   socket.join(usuario.id);//global, socket.id ,usuario.id

   //limpiar cuando alguien se desconecta
   
  socket.on('disconnect',()=>{
      chatMensajes.desconectarUsuario(usuario.id);
      io.emit('usuarios-activos',chatMensajes.usuariosArr)


  });

  socket.on('enviar-mensaje',({uid,mensaje})=>{

    if(uid){
       //
       socket.to(uid).emit('mensaje-privado',{de:usuario.nombre,mensaje})
    }else{
        chatMensajes.enviarMensaje(usuario.uid,usuario.nombre,mensaje);
        io.emit('recibir-mensajes',chatMensajes.ultimosDiez)
    }
  
  })

}


module.exports = { SocketController }