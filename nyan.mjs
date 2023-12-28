import jimp from 'jimp'
import  _ from 'lodash'
import getConn from './getConn.mjs'

const CONNECTIONS_COUNT = 240
const SEND_DELAY = 1;
const SIZE = [1280, 768]
// image.getPixelColor(x, y); // returns the colour of that pixel e.g. 0xFFFFFFFF
let connections;

(async () => {
  const images = (await Promise.all(_.chain(_.range(12))
    .map(async i => await jimp.read(`./nyan/frame_${i.toString().padStart(2,'0')}_delay-0.07s.gif`))
    .value()
  ))
  .map(i => i.scale(2))
  const {width, height} = images[0].bitmap

  // const replaceConn = (err, conn) => { console.log(err) }
  const replaceConn = (err, conn) => {
    // console.log('replacing', err, connections.indexOf(conn))
    connections.splice(connections.indexOf(conn), 1, getConn(replaceConn)).pop().destroy()
  }
  connections = _.range(CONNECTIONS_COUNT).map(i => getConn(replaceConn))
  const nextConn = () => (connections.unshift(connections.pop()),connections[0])
  // 1280 768
  const offset = {x: 0, y: 230}//768-height}
  let dx = 50
  let dy = 50

  const white = _
    .range(height)
    .map((y) => _
      .range(width)
      .map(x => `PX ${x+offset.x} ${y+offset.y} ffffff\n`)
      .join('')
    )
    .join('')

  const cmd = images.map( image => _
    .chain(_.range(width))
    .map(x => _
      .range(height)
      .filter(y =>
        image.getPixelColor(x, y).toString(16).padStart(6, 'f') != 'ffffff00' &&
        // image.getPixelColor(x, y).toString(16).padStart(6, '0') != 'ffffffff' &&
        image.getPixelColor(x, y).toString(16).padStart(6, '0') != '000000ff' &&
        // image.getPixelColor(x, y).toString(16).padStart(6, 'f') != 'ffffffff' &&

        x <= SIZE[0] &&
        y <= SIZE[1] &&
        1
      )
      .map(y => `PX ${x+offset.x} ${y+offset.y} ${image.getPixelColor(x, y).toString(16).padStart(6, '0')}\n`)
    )
    .flatten()
    .shuffle()
    //.chunk(CONNECTIONS_COUNT)
    .chunk(1)
    .map((c) => c.join(''))
    .value()
  )

  const nextcmd = () => (cmd.unshift(cmd.pop()), cmd[0]);
  let currCmd = nextcmd()
  let time = performance.now()
  const sendLogo = () => {
    if(time + 41 < performance.now()) {
      currCmd = nextcmd()
      time = performance.now()
      console.log('+',time)
    }
    if(time + 1 < performance.now()) {
      console.log('d', time)

      currCmd.forEach(chunk => nextConn().write(chunk))
    }
    // setTimeout(() => nextConn().write(white), 25)

  }
  while(1) {
    sendLogo()
  }
  // setInterval(sendLogo, SEND_DELAY)
  // setInterval(sendLogo, SEND_DELAY)
  // setInterval(sendLogo, SEND_DELAY)
})()



