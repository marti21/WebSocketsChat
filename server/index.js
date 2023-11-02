const { Server } = require("socket.io");
const { createServer } = require("http");
const express = require("express");
const logger = require("morgan");
const { Client } = require('pg');

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
    connectionStateRecovery:{

    }
})

const client = new Client({
    user: 'knzdojkc',
    host: 'flora.db.elephantsql.com',
    database: 'knzdojkc',
    password: '7eAfBZQqohKvWxJjhRCGUesh5NiyG0Mc',
    port: 5432, // El puerto predeterminado de PostgreSQL es 5432
});

client.connect();

async function createTable() {
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          content TEXT,
          username TEXT
        )
      `);
      console.log('Tabla "messages" creada con éxito.');
    } catch (error) {
      console.error('Error al crear la tabla:', error);
    }
}

createTable();

server.on('close', () => {
    client.end();
    console.log('Connection closed DB')
});

io.on('connection', async (socket) => {
    console.log('a user has connected!', socket.handshake.auth);

    socket.on('disconnect', () => {
        console.log('An user has disconnected');
    })
    socket.on('chat message', async (message, username) => {
        console.log("Message: " + message);
        let result
        let lastmessageId
        try{
            result = await client.query('INSERT INTO messages (content,username) VALUES ($1,$2) RETURNING id', [message, username]);
            lastmessageId = result.rows[0].id;
            console.log('ID del nuevo mensaje insertado:', lastmessageId);
        }catch(e){
            console.error('Error al guardar el mensaje en la db', e)
            return
        }

        io.emit('chat message', message, username, lastmessageId);
    })

    if(!socket.recovered){ //-Si recuperase los mensaje sin conexion o al recargar o entrar al chat
        try {
            const results = await client.query('SELECT id, content, username FROM messages WHERE id > ($1)', [socket.handshake.auth.serverOffset]);

            results.rows.forEach(row => {
                lastmessageId = row.id;
                socket.emit('chat message', row.content, row.username, lastmessageId);
            })
        
        }catch(e){
            console.error(e)
            return
        }
    }
})

app.use(logger('dev'))

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
