import { dawg } from './final.js'
import { reactive, memo } from './hok.js'
import { dom } from './dom.js'

let send = () => console.log('not conntexted')
async function publishSubscribe() {
	const ably = new dawg.Ably.Realtime("f8JcZg.XRPrxA:MdTyXnycB5ahByz--1CIY0-BMFLvLBIz8cSMgS6vTNM")
	ably.connection.once("connected", () => { console.log("Connected to Ably!") })
	const channel = ably.channels.get("getting-started-widget")
	send = (v) => channel.publish('cmd', v)
}
publishSubscribe();

let setsymbol = '(set)'

let colorput = (alpha = false) => {
	let r = reactive(255)
	let g = reactive(0)
	let b = reactive(0)
	let a = reactive(1)
	let rel = ['input', {
		style: memo(() => `background: linear-gradient(
	0.25turn,
	rgb(0, ${g.value()},${b.value()}),
	rgb(255, ${g.value()},${b.value()}))`, [r, g, b]),
		type: 'range', min: 0, max: 255, value: 255, step: 1, oninput: e => r.next(e.target.value)
	}]
	let gel = ['input', {
		style: memo(() => `background: linear-gradient(
	0.25turn,
	rgb(${r.value()},0,${b.value()}),
	rgb(${r.value()},255,${b.value()}))`, [r, g, b]),
		type: 'range', min: 0, max: 255, value: 0, step: 1, oninput: e => g.next(e.target.value)
	}]
	let bel = ['input', {
		style: memo(() => `background: linear-gradient(
	0.25turn,
	rgb(${r.value()},${g.value()}, 0),
	rgb(${r.value()},${g.value()}, 255))`, [r, g, b]),
		type: 'range', min: 0, max: 255, value: 0, step: 1, oninput: e => b.next(e.target.value)
	}]

	let ael = ['input', {
		style: memo(() => `background: linear-gradient(
	0.25turn,
	rgba(${r.value()},${g.value()}, ${b.value()}, 0),
	rgba(${r.value()},${g.value()}, ${b.value()}, 1))`, [r, g, b]),
		type: 'range', min: 0, max: 1, value: 0, step: .02, oninput: e =>a.next(e.target.value)
	}]

	let show = ['div', { style: memo(() => `background-color: rgb(${r.value()}, ${g.value()},${b.value()});width: 50px;height:30px;`, [r, g, b]) }]
	let c = dom(['.color', show, rel, gel, bel, alpha ? ael : ''])
	c.value = () => `rgba(${r.value()}, ${g.value()},${b.value()}, ${a.value()})`
	return c
}
let backgroundColor = colorput()
let highlight = colorput(true)
let outlineColor = colorput(true)
let commandLogColor = colorput(true)
let textColor = colorput()
// dom(['input.color', { type: 'color', value: '#0000ff' }])
let fontFamily = dom(['select',
	...[
		"ABC Marist Variable Book Unlicensed Trial",
		"ABC Estragon Unlicensed Trial",
		"ABC Maxi Round Unlicensed Trial",
		"ABC ROM Compressed Unlicensed Trial",
		"hermit", "Arial", "Times", "Courier", "Gap Sans",
		"Apple Symbols", "bianzhidai", "bianzhidai_noBG", 'Chikki', "CirrusCumulus"

	]
		.map(e => ['option', { value: e }, e.slice(0, 18), e.length > 17 ? '...' : ""])
])

let blendmodes = ["normal",
	"multiply",
	"screen",
	"overlay",
	"darken",
	"lighten",
	"color-dodge",
	"color-burn",
	"hard-light",
	"soft-light",
	"difference",
	"exclusion",
	"hue",
	"saturation",
	"color",
	"luminosity",
	"plus-darker",
	"plus-lighter"]

let logBlend = dom(['select', ...blendmodes.map(e => ['option', { value: e }, e])])
let blur = dom(['input', {type: 'range', min: 0, max: 1.8, value: 0, step: 0.03 }])
let outlineWidth = dom(['input', {type: 'range', min: 0, max: 8, value: 0, step: 0.05 }])
let commandLogSize = dom(['input', {type: 'range', min: .1, max: 1.2, value: 0, step: 0.02 }])
let item = (title, input, sendfn) =>
	[".item",
	['p.title', title],
	 ['button.hide', {
		 onclick: e => {
			console.log(e.target.parentNode.childNodes)
			e.target.parentNode.childNodes.forEach(d => {
				if (d.classList.contains('contents')){
					if (d.style.display == 'none'){
						d.style.display = 'block'
						e.target.innerText = 'hide'
					}else {
						d.style.display ='none'
						e.target.innerText = 'show'
					}
							
				}
		 })
		}},'hide'],
		['.contents', input, ['button', { onclick: sendfn }, setsymbol]]
	]

let root = [
	'.root',
	item('Typeface', fontFamily, () => send('fontFamily:' + fontFamily.value)),
	item("Text Color", textColor, () => send('color:' + textColor.value())),
	item('Background', backgroundColor, () => send('background:' + backgroundColor.value())),
	item('Highlight', highlight, () => send('highlight:' + highlight.value())),
	item('Text Stroke', outlineColor, () => send('outlineColor:' + outlineColor.value())),
	item('Text Stroke Width', outlineWidth, () => send('outlineWidth:' + outlineWidth.value )),
	item('Blur', blur, () => send('blur:' + blur.value + "px")),
	item('Command Log Size', commandLogSize, () => send('commandLogSize:' + commandLogSize.value + 'em')),
	item('Command Log Color', commandLogColor, () => send('commandLogColor:' + commandLogColor.value() )),
item('Command Log Blend', logBlend, () => send('logBlend:' + logBlend.value)),

	// font family
	// box-shadow
	// color
	// border
	// radius
	// p5 elements
]
document.body.appendChild(dom(root))
