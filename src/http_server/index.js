import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { WebSocketServer } from 'ws';
import { handleMessage } from './controllers/message.js'

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
    // const onMessage = (data) => {
    //     console.log('received:', JSON.parse(data));
    // }

    const onConnection = (ws) => {
        sockets.push(ws)
        ws.on('message', async (data) => {
            const message = JSON.parse(data)
            console.log('MESSAGE:', message)
            await handleMessage(ws, message)
        });
        // ws.send('something');
    }
    
    // ws.on('message', (data) => onMessage(data))
    wss.on('connection', (ws) => onConnection(ws))
});

console.log(`WebSocket server started on port ${wsPort}`)
