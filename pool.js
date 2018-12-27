const net = require('net')
const _ = require('lodash')

const connections = _.range(10)
    .map(conn => getConn(conn))

function getConn(connName = 'lol'){

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
        connections[connections.indexOf(client)] = getConn(connName)
        console.log('Client socket disconnect. ')
    })

    client.on('timeout', function () {
        connections.splice(connections.indexOf(client), 1)
        console.log('Client connection timeout. ')
    })

    client.on('error', function (err) {
        connections[connections.indexOf(client)] = getConn(connName)
        console.error(JSON.stringify(err))
    })

    return client
}

const fs = require('fs')
const bmp = require('bmp-js')
const bmpBuffer = fs.readFileSync('./tami-logo.bmp')
const bmpData = bmp.decode(bmpBuffer)
const chunkCount = 10
const colors = [
    'C0C0C0',
    '808080',
    'FF0000',
    '800000',
    'FFFF00',
    '808000',
    '00FF00',
    '008000',
    '00FFFF',
    '008080',
    '0000FF',
    '000080',
    'FF00FF',
    '800080'
]
const nextColor = () => {
    const color = colors.pop()
    colors.unshift(color)
    return color;
}
const chunks =
    _(bmpData.data)
        .chunk(4)
        .map(([a,b,g,r]) =>
            [r,g,b].map(c => c.toString(16)).join('')
        )
        .chunk(bmpData.width)
        .map((row, y) => {
            return row
                .map((color, x) =>
                    `PX ${x} ${y} ${color.replace('000', '00FF00')}`
                )
                .filter(color => !color.endsWith('ffffff'))
                .join('\n')
        }
        )
        .chunk(chunkCount)
        .map(chunk => chunk.join('\n'))
        .value()

const nextConn = () => {
    const conn = connections.pop()
    connections.unshift(conn)
    return conn || connections.unshift(getConn())[0];
}

const sendLogo = () => {
    chunks.map((chunk, i) =>
        nextConn().write(`OFFSET 1100 0\n${chunk.replace(/00FF00/g, nextColor())}`)
    )
}
// console.log(chunks)
setInterval(sendLogo, 100)
