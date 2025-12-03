import { dawg } from './final.js'
import { reactive, memo } from './hok.js'
import { dom } from './dom.js'

let send = () => console.log('not conntexted')
let input = dom("input", {
	onkeydown: e => e.key == 'Enter' ? send(e.target.value) : null
})
let btn = dom('button', { onclick: () => send(input.value) }, 'set')

document.body.appendChild(input)
document.body.appendChild(btn)

async function publishSubscribe() {
	const ably = new dawg.Ably.Realtime("f8JcZg.XRPrxA:MdTyXnycB5ahByz--1CIY0-BMFLvLBIz8cSMgS6vTNM")
	ably.connection.once("connected", () => { console.log("Connected to Ably!") })
	const channel = ably.channels.get("getting-started-widget")
	send = (v) => channel.publish('cmd', v)
}
publishSubscribe();

let setsymbol = '(set)'

let textColor = dom(['input.color', { type: 'color', value: '#ff0000' }])
let backgroundColor = dom(['input.color', { type: 'color', value: '#0000ff' }])
let fontFamily = dom(['select',
	['option', { value: "hermit" }, 'hermit'],
	['option', { value: "Arial" }, 'Arial'],
	['option', { value: "Times" }, 'Times'],
	['option', { value: "Courier" }, 'Courier'],
])
let root = ['.root',
	[".item",
		['p.title', 'Text Color'],
		['.contents',
			textColor,
			['button',
				{ onclick: () => send('color:' + textColor.value) },
				setsymbol
			]]
	],

	[".item",
		['p.title', 'Background'],
		['.contents',
			backgroundColor,
			['button',
				{ onclick: () => send('background:' + backgroundColor.value) },
				setsymbol
			]
		]
	],

	['.item',
		['.contents',
			fontFamily,
			['button',
				{ onclick: () => send('fontFamily:' + fontFamily.value) },
				setsymbol
			]
		]
	]
	// font family
	// box-shadow
	// color
	// border
	// radius
	// p5 elements
]
document.body.appendChild(dom(root))
