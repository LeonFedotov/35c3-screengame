import _ from 'lodash'
import fs from 'fs'
import bmp from 'bmp-js'
import getConn from './getConn.mjs'

const CONNECTIONS_COUNT = 10
const SEND_DELAY = 10

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

const {data, width, height} = bmp.decode(fs.readFileSync('./baron-on-canon.bmp'))
const chunks = _(data)
    //group per pixel
    .chunk(4)
    //map and convert to rgb hex string
    .map(([a,b,g,r]) => [r,g,b].map(c => c == 0 ? '00' : c.toString(16)).join(''))
    //split by row width
    .chunk(width)
    .map(row => row.filter(color => {
        // color != '00ff00' && console.log(color)
        return color != '00ff00' || color != '0f0' || color != '00f700'
    }))


const offset = {x: 1000, y: 0}
let dx = width
let dy = height

const sendLogo = () => {
    offset.x += dx
    offset.y += dy


    if(offset.x > 1920-width || offset.x <= 0) {
        dx *= -1
    }

    if(offset.y > 1080-height || offset.y <= 0) {
        dy *= -1
    }

    // const {x, y} = offset
    // process.stdout.write('.'+offset.x+':'+offset.y)
    // console.log('sending', x, y, '\n')
    chunks
        .map((row, y) => row.map((color, x) => `PX ${x+offset.x} ${y+offset.y} ${color}`).join('\n'))
    //split per connections
    .chunk(CONNECTIONS_COUNT)
    //join each chunk rows
    .map(chunk => chunk.join('\n'))
    .value()
    .map((chunk, i) => {
        // console.log('sending', '\n', `${chunk.substring(0, 100)}`, '\n')
        nextConn().write(`${chunk}`)
    })
}

setInterval(sendLogo, SEND_DELAY)
