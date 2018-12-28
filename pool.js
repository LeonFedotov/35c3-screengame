const net = require('net')
const _ = require('lodash')
const fs = require('fs')
const bmp = require('bmp-js')

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


const connections = _.range(10).map(i => getConn(i))
const {data, width, height} = bmp.decode(fs.readFileSync('./tami-logo.bmp'))

const chunks = _(data)
    //group per pixel
    .chunk(4)
    //map and convert to rgb hex string
    .map(([a,b,g,r]) => [r,g,b].map(c => c == 0 ? '00' : c.toString(16)).join(''))
    //split by row width
    .chunk(width)
    //create command strings
    .map((row, y) => row.map((color, x) => `PX ${x} ${y} ${color}`).join('\n'))
    //split per connections
    .chunk(connections.length)
    //join each chunk rows
    .map(chunk => chunk.join('\n'))
    .value()

const sendLogo = () => {
    console.log('sending logo...')
    chunks.map((chunk, i) =>
        nextConn().write(`OFFSET 0 200\n${chunk.replace(/000000/g, nextColor())}`)
    )
}

setInterval(sendLogo, 10)
