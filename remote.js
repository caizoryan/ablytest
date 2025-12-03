import { dawg } from './final.js'
import { reactive, memo } from './hok.js'
import { dom } from './dom.js'

let send = () => console.log('not conntexted')
let input = dom("input", {
	onkeydown:e => e.key == 'Enter' ? send(e.target.value): null
})
let btn = dom('button', {onclick: () => send(input.value)}, 'set')

document.body.appendChild(input)
document.body.appendChild(btn)

async function publishSubscribe() {
  const ably = new dawg.Ably.Realtime("f8JcZg.XRPrxA:MdTyXnycB5ahByz--1CIY0-BMFLvLBIz8cSMgS6vTNM")
  ably.connection.once("connected", () => {console.log("Connected to Ably!")})
  const channel = ably.channels.get("getting-started-widget")
	send = (v) => channel.publish('cmd',v)
}
publishSubscribe();


let root = ['.root'
						// font family
						// box-shadow
						// color
						// border
						// radius
						// p5 elements
					 ]
document.body.appendChild(dom(root))
