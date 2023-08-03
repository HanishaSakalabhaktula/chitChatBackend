const express = require('express');
const app = express();
const userRoutes = require('./Routes/userRoutes')
const User = require('./Models/UserModel')
const Message = require('./Models/MessageModel');
const cors = require('cors')
require('dotenv').config();

const rooms = ['Dark Arts', 'Charms', 'Divination', 'Magical Creatures'];

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());


const server = require('http').createServer(app);
const PORT = process.env.PORT;
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['POST', 'GET']
    }
})

app.get('/rooms', (req, res) => {
    res.json(rooms);
})

const getLastMessagesFromRoom = async (room) => {
    let roomMessages = await Message.aggregate([
        {$match: {to: room}},
        {$group: {_id: '$date', messagesByDate: {$push: '$$ROOT'}}}
    ])
    return roomMessages;
}


const sortRoomMessagesByDate = (msgs) => {
    return msgs.sort(function(a, b){
        let date1 = a._id.split('/');
        let date2 = b._id.split('/');

        date1 = date1[2] + date1[0] + date1[1];
        date2 = date2[2] + date2[0] + date2[1];

        return date1 < date2 ? -1 : 1;
    })
}
//socket connection
io.on('connection', (socket) => {
    
    socket.on('new-user', async()=> {
        const members = await User.find();
        io.emit('new-user', members);
    })

    socket.on('join-room', async (room) => {
        socket.join(room);
        let roomMessages = await getLastMessagesFromRoom(room);
        roomMessages = sortRoomMessagesByDate(roomMessages);

        socket.emit('room-messages', roomMessages);
    })

    socket.on('message-room', async (room, content, sender, time, date) => {
        const newMessage = await Message.create({content, from: sender, time, date, to: room});
        console.log(newMessage);
        let roomMessages = await getLastMessagesFromRoom(room);
        roomMessages = sortRoomMessagesByDate(roomMessages);
        //sending message
        io.to(room).emit('room-messages', roomMessages);

        socket.broadcast.emit('notifications', room);
    })
     

    app.delete('/logout', async (req, res) => {
        try {
            const { _id, newMessage } = req.body;
            // console.log(_id);
            const user = await User.findById(_id);
            user.status = 'offline';
            user.newMessage = newMessage;
            await user.save();
    
            const members = await User.find();
    
            socket.broadcast.emit('new-user', members);
            res.status(200).send();
        } catch (er) {
            console.log(er);
            res.status(400).send();
        }
    })
})

require('./connection');
app.use('/users', userRoutes);

server.listen(PORT, () => {
    console.log("Server connected successfully");
})