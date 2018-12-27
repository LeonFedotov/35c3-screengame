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

const chunks =
    _.chunk(_.range(1920)
        .map(row => _.range(1080).map(col =>
            `PX ${row} ${col} FFFFFF`
        ).join('\n'))
        ,10)
        .map(chunk => chunk.join('\n'))

const nextConn = () => {
    const conn = connections.pop()
    connections.unshift(conn)
    return conn || connections.unshift(getConn())[0];
}

const sendLogo = () => {
    chunks.map((chunk, i) =>
        nextConn().write(chunk)
    )
}
// console.log(chunks)
setInterval(sendLogo, 100)
