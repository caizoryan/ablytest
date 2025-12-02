import {dawg} from './final.js'

let messages = document.createElement('div')

let send = () => console.log('not conntexted')

let input = document.createElement("input")
let btn = document.createElement('button')

btn.onclick = () => send(input.value)

document.body.appendChild(input)
document.body.appendChild(btn)
document.body.appendChild(messages)

async function publishSubscribe() {
  // Connect to Ably with your API key
  const ably = new dawg.Ably.Realtime("f8JcZg.XRPrxA:MdTyXnycB5ahByz--1CIY0-BMFLvLBIz8cSMgS6vTNM")
  ably.connection.once("connected", () => {console.log("Connected to Ably!")})

  // Create a channel called 'get-started' and register a listener to subscribe to all messages with the name 'first'
  const channel = ably.channels.get("getting-started-widget")
  await channel.subscribe("first", (message) => {
		let d = document.createElement('p')
		d.innerText=(message.data)
    messages.appendChild(d)
  });

  // Publish a message with the name 'first' and the contents 'Here is my first message!'
  await channel.publish("first", "Here is my first message!")
	send = (v) => channel.publish('first',v)
}

publishSubscribe();
