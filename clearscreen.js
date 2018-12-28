const net = require('net')
const _ = require('lodash')
const fs = require('fs')
const bmp = require('bmp-js')

const CONNECTIONS_COUNT = 5
const SEND_DELAY = 10

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
const connections = _.range(CONNECTIONS_COUNT).map(i => getConn(i))

const chunks = _.chunk(_.range(1080).map(row =>
    _.range(1920).map(col => `PX ${col} ${row} ff0000`).join('\n')
), connections.length).map(chunk => chunk.join('\n'))

const clearScreen = () => {
    chunks.map((chunk, i) =>
        nextConn().write(`${chunk}`)
    )
}

setInterval(clearScreen, SEND_DELAY)
