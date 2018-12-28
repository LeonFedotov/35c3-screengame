const net = require('net')
const _ = require('lodash')

const CONNECTIONS_COUNT = 10
const SEND_DELAY = 100

const getConn = (name = _.uniqueId(), options = { host: '151.217.40.82', port: 1234 }) => {
    const conn = net
        .createConnection(options, () => console.log(name, 'connection established'))
        .setTimeout(5000)
        .setEncoding('utf8')
        .on('data', (data) => console.log(name, 'incoming ', data))
        .on('timeout', () => (console.log(name, 'timeout'), replaceConn(conn)))
        .on('error', (err) => (console.error(name, err), replaceConn(conn)))
        .on('end', () => console.log(name, 'socket disconnect'))
    return conn
}

const nextConn = () => (connections.unshift(connections.pop()),connections[0])
const replaceConn = (conn) => connections.splice(connections.indexOf(conn), 1, getConn()).pop().destroy()
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

const nextColor = () => (colors.unshift(colors.pop()),colors[0])
const connections = _.range(CONNECTIONS_COUNT).map(i => getConn())

const chunks = _.range(CONNECTIONS_COUNT)

for(x = 0; x<1920;x++) {
    for(y=0; y<1080;y++) {
        chunks[(x+y)%CONNECTIONS_COUNT]+=`PX ${x} ${y} ffff00\n`
    }
}

const clearScreen = () => {
    process.stdout.write('.')
    chunks.map((chunk) => nextConn().write(chunk))
}

setInterval(clearScreen, SEND_DELAY)
