import net from 'net'
let count = 0;
export default function getConn(error = (err) => console.error(JSON.stringify(err))){
    // console.log('getConn')
    const options = {
        host:'151.217.24.77',
        port: 1337
    }

    // Create TCP client.
    const client = net.createConnection(options, function () {
        // console.log('connect: ' + client.remoteAddress + ":" + client.remotePort)
        count+=1
        console.log(`${count}/500`)
    })

    client.setTimeout(1000)
    client.setEncoding('utf8')

    // When receive server send back data.
    client.on('data', function (data) {
        console.log('Server return data : ' + data)
    })

    // When connection disconnected.
    client.on('end',function () {
        // console.log('Client socket disconnect. ')
        count -= 1
    })

    client.on('timeout', function () {
        // console.log('Client connection timeout. ')
        count -= 1
        error('timeout', client)
    })

    client.on('error', (err) => error(err, client))

    return client
}
// 1280 768
// module.exports = getConn