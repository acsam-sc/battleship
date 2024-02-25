import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { WebSocketServer } from 'ws';
import { handleMessage } from './controllers/message.js'
import { deleteActiveUser } from './services/users.js'

const wsPort = 3000
let sockets = []

export const httpServer = http.createServer(function (req, res) {
    const __dirname = path.resolve(path.dirname(''));
    const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url);
    fs.readFile(file_path, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.end(JSON.stringify(err));
            return;
        }
        res.writeHead(200);
        res.end(data);
    });

    const wss = new WebSocketServer({ port: wsPort })

    const onConnection = async (ws) => {
        ws.id = Math.floor(Math.random() * 100)
        sockets.push(ws)
        ws.on('message', async (data) => {
            const message = JSON.parse(data)
            console.log('MESSAGE:', message)
            await handleMessage(ws, message)
        });
        ws.on('close', async () => {
          sockets.filter((c) => c.readyState !== 3)
          console.log(`WebSocket with ID=${ws.id} was closed`)
          await deleteActiveUser(ws.id)
        })
    }
    
    wss.on('connection', async (ws) => await onConnection(ws))
});

console.log(`WebSocket server started on port ${wsPort}`)
