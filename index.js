const net = require('net')
const _ = require('lodash')
// This function create and return a net.Socket object to represent TCP client.
function getConn(connName){

    const options = {
        host:'151.217.40.82',
        port: 1234
    }

    // Create TCP client.
    const client = net.createConnection(options, function () {
        console.log('Connection name : ' + connName)
        console.log('Connection local address : ' + client.localAddress + ":" + client.localPort)
        console.log('Connection remote address : ' + client.remoteAddress + ":" + client.remotePort)
    })

    client.setTimeout(1000)
    client.setEncoding('utf8')

    // When receive server send back data.
    client.on('data', function (data) {
        console.log('Server return data : ' + data)
    })

    // When connection disconnected.
    client.on('end',function () {
        console.log('Client socket disconnect. ')
    })

    client.on('timeout', function () {
        console.log('Client connection timeout. ')
    })

    client.on('error', function (err) {
        console.error(JSON.stringify(err))
    })

    return client
}

const fs = require('fs')
const bmp = require('bmp-js')
const bmpBuffer = fs.readFileSync('./tami-logo.bmp')
const bmpData = bmp.decode(bmpBuffer)

const cmd =
    _(bmpData.data)
        .chunk(4)
        .map(([a,b,g,r]) =>
            [r,g,b].map(c => c.toString(16)).join('')
        )
        .chunk(bmpData.width)
        .map((row, y) =>
            row
                .map((color, x) =>
                    `PX ${x} ${y} ${color.replace('000', 'cc229f')}`
                )
                .filter(color => !color.endsWith('ffffff'))
                .join('\n')
        )
        .value()
        .join('\n')


const client = getConn('Node')
// console.log(`sending`,cmd)
const offset = 'OFFSET 1000 100\n'
const sendLogo = () => {
    client.write(`OFFSET 1000 100\n${cmd}\n`)
}

setInterval(sendLogo, 10)
