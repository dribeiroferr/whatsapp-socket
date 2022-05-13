const express = require('express');
const app = express();
const venom = require('venom-bot');
const http = require('http')
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: '*',

}});
const fs = require('fs');
const path = require('path');

app.set("view engine", "ejs");


app.use(express.static(__dirname + '/images'));

// app.listen(9009, () => {
//     console.log("🚀 App is running...");
// });

app.get('/', (req,res) => {
    res.render('home');
});

server.listen(9009, () => {
    console.log("🚀 App is running on 9009");
});


io.on("connection", (socket) => {
    console.log("User Connected: ", socket.id)

    socket.on("message", () => {

    venom
    .create(
        `wp-restaurante-${socket.id}`,
        (base64Qr, asciiQR, attempts, urlCode) => {
        console.log(asciiQR); // Optional to log the QR in the terminal
        var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer.from(matches[2], 'base64');

        var imageBuffer = response;
        require('fs').writeFile(
            `./images/${socket.id}_out.png`,
            imageBuffer['data'],
            'binary',
            function (err) {
            if (err != null) {
                console.log(err);
            }
            }
        );
        },
        (statusSession, session) => {
            console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
            //Create session wss return "serverClose" case server for close
            console.log('Session name: ', session)
        
        }, {
            multidevice: true,
            logQR: false
        })
    .then((client) => {
        start(client);
    })
    .catch((erro) => {
        console.log(erro);
    });

        function start(client){
          client.onStateChange((state) => {
            socket.emit('message', 'Status: ' + state);
            console.log('State changed: ', state)
          })
        }
    });

    socket.on("ready", async () => {
        setTimeout(socket.emit('ready',__dirname + `/images/${socket.id}_out.png`), 1200)
    })
  });