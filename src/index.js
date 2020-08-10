const path = require('path')
const http = require('http')
const express=require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const {addUser,removeUser,getUser,getUsersInRoom }=require('./utils/users')


const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicdirectorypath = path.join(__dirname,"../public")

const {generateMessage}=require('./utils/messages')
const {generateLocationMessage}=require('./utils/messages')


app.use(express.static(publicdirectorypath))



io.on('connection', (socket)=>{

console.log('new connection')



socket.on('join',(options,callback)=>{
    
    const {error,user}=addUser({id:socket.id,...options})

    if(error){
return  callback(error)
    }
    socket.join(user.room)

    socket.emit('welmes',generateMessage("admin",'Welcome user'))
socket.broadcast.to(user.room).emit('message',generateMessage("admin",user.username+'has joined'))

io.to(user.room).emit('roomData',{
    room:user.room,
    users:getUsersInRoom(user.room)
})

})

socket.on('sendMessage',(message,callback)=>{
    const user = getUser(socket.id)
    const filter = new Filter()
    if(filter.isProfane(message)){
        return callback('profinity not allowed')
    }
    io.to(user.room).emit('message',generateMessage(user.username,message))
    io.emit("message",generateMessage(message))
    callback()
})

socket.on('sendLocaion',(coords)=>{
    const user = getUser(socket.id)
    io.to(user.room).emit('locationmessage',generateLocationMessage(user.username,'message','http://google.com/maps?q='+coords.latitude+","+coords.longitude))
})

socket.on('disconnect',()=>{
const users =removeUser(socket.id)

if(user){
    io.to(user.room).emit(generateMessage("admin",user.username+'user left'))

    io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
    })

}
})

})

server.listen(port,()=>{
    console.log('server is up on port '+port)
})