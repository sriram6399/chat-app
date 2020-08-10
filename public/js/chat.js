const socket = io()

const $messageForm =document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $messages=document.querySelector('#messages')

const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML

const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML


const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = ()=>{

    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset){
          $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on('welmes',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm:A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(url)=>{

console.log(url)
const html = Mustache.render(locationMessageTemplate,{
    username:url.username
    url:url.url,
    createdAt:moment(url.createdAt).format('h:mm:A')

})
$messages.insertAdjacentHTML('beforeend',html)
autoscroll()

})

socket.on('roomData',({room,users})=>{
    const html= Mustache.render(sidebarTemplate,{
        room,users
    })
    document.querySelector('#sidebar').innerHTML
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')

    const message =e.target.elements.message.value

    socket.emit("sendMessage",message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
       return  console.log('eroor')
         }
        console.log('message acknowledged')
    })
})

document.querySelector('#send-location').addEventListener('click',(e)=>{
    if(navigator.geolocation){
        return alert('Geolocation not supported')
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',{

            latitude: position.coords.latitude,

            longitude: position.coords.longitude
        })

    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})