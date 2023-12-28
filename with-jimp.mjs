import jimp from 'jimp'
import  _ from 'lodash'
import getConn from './getConn.mjs'

const CONNECTIONS_COUNT = 600
const SEND_DELAY = 1;
const SIZE = [1280, 768]
// image.getPixelColor(x, y); // returns the colour of that pixel e.g. 0xFFFFFFFF
let connections;

(async () => {
  const image = await jimp.read('./tslof.png')
  const {width, height} = image.bitmap
  // const replaceConn = (err, conn) => { console.log(err) }
  const replaceConn = (err, conn) => {
    // console.log('replacing', err, connections.indexOf(conn))
    connections.splice(connections.indexOf(conn), 1, getConn(replaceConn)).pop().destroy()
  }
  connections = _.range(CONNECTIONS_COUNT).map(i => getConn(replaceConn))
  const nextConn = () => (connections.unshift(connections.pop()),connections[0])
  // 1280 768
  const offset = {x: 980, y: 230}//768-height}
  let dx = 50
  let dy = 50


  const cmd =   _
    .chain(_.range(width))
    .map(x => _
      .range(height)
      .filter(y =>
        image.getPixelColor(x, y).toString(16).padStart(6, '0') != 'ffffff00' &&
        image.getPixelColor(x, y).toString(16).padStart(6, '0') != 'ffffffff' &&
        image.getPixelColor(x, y).toString(16).padStart(6, '0') != '000000ff' &&
        image.getPixelColor(x, y).toString(16).padStart(6, 'f') != 'ffffffff' &&

        x <= SIZE[0] &&
        y <= SIZE[1] &&
        1
      )
      .map(y => `PX ${x+offset.x} ${y+offset.y} ${image.getPixelColor(x, y).toString(16).padStart(6, '0')}\n`)
    )
    .flatten()
    .shuffle()
    .chunk(CONNECTIONS_COUNT)
    // .chunk(1)
    .map((c) => c.join(''))
    .value()


    const sendLogo = () => {
      cmd.forEach(chunk => nextConn().write(chunk))


    // offset.x += dx
    // offset.y += dy

    // if(offset.x > SIZE[0]-width || offset.x <= 0) {
    //   dx *= -1
    // }

    // if(offset.y > SIZE[1]-height || offset.y <= 0) {
    //   dy *= -1
    // }
  }
  setInterval(sendLogo, SEND_DELAY)
  // setInterval(sendLogo, SEND_DELAY)
  // setInterval(sendLogo, SEND_DELAY)
})()



