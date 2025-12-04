import { dawg } from './final.js'
import { reactive, memo } from './hok.js'
import { dom } from './dom.js'
import { parse, serialize } from './cmd.js'
let messages = dom('.messages')
async function publishSubscribe() {
	// Connect to Ably with your API key
	const ably = new dawg.Ably.Realtime("f8JcZg.XRPrxA:MdTyXnycB5ahByz--1CIY0-BMFLvLBIz8cSMgS6vTNM")
	ably.connection.once("connected", () => { console.log("Connected to Ably!") })

	// Create a channel called 'get-started' and register a listener to subscribe to all messages with the name 'first'
	const channel = ably.channels.get("getting-started-widget")
	await channel.subscribe("cmd", (cmd) => {
		let fn = parse(cmd.data)
		let p = 'CMD: ' + cmd.data
		if (fn) fn()
		else p = 'FAILED: ' + cmd.data

		messages.appendChild(dom('p', p))
	});
}
publishSubscribe();

let globalhistory = () => {
	let undo = []
	let undobuffer = []
	let redo = []
	let doundo = () => {
		if (undo.length == 0) return undefined
		let re = undo.pop()()
		redo.push(re)
	}

	let doredo = () => {
		if (redo.length == 0) return undefined
		let un = redo.pop()()
		undo.push(un)
	}

	// need to use a raf so multiple function calls get
	// counted as one undo/redo
	let RAF = () => {
		if (undobuffer.length == 1) undo.push(undobuffer.pop())
		else if (undobuffer.length > 1) {
			let undos = undobuffer.reduce((acc, e) => (acc.push(e), acc), [])
			// a fn that will do all fns, collect and return a <-
			let group_dos = dos => () => {
				let redos = dos.map(e => e())
				return group_dos(redos)
			}

			undo.push(group_dos(undos))
			undobuffer = []
		}
		requestAnimationFrame(RAF)
	}

	requestAnimationFrame(RAF)

	return {
		canUndo: () => (undo.length > 0),
		canRedo: () => (redo.length > 0),
		listUndo: () => undo,
		listRedo: () => undo,
		undo: doundo,
		redo: doredo,
		make: (reactive) => {
			return {
				isReactive: true,
				value: reactive.value,
				subscribe: reactive.subscribe,
				next: (v) => {
					undobuffer.push(createundo(reactive))
					redo = []
					reactive.next(v)
				},
				undo: doundo,
				redo: doredo,
			}
		}
	}
}
let createundo = (reactive) => {
	let v = reactive.value();
	return () => {
		let u = createundo(reactive);
		reactive.next(v)
		return u
	}
}
let history = globalhistory()

// ------- ------- -------
// DISPLAY
// ------- ------- -------

let widthify = (v) => memo(() => 'width: ' + v.value(), [v])
let dcwidth = history.make(reactive('90vw'))
let ddwidth = history.make(reactive('90vw'))

let dcdisplay = history.make(reactive(['div']))
let dddisplay = history.make(reactive(['div']))

let designcaption = dom(['.box#caption', { style: widthify(dcwidth) }, dcdisplay])
let designdispaly = dom(['.box#display', { style: widthify(ddwidth) }, dddisplay])

let interval

let slidenumber = reactive(-1)
let seconds = reactive(0)
slidenumber.subscribe(e => {
	if (slidenumber.value() == 0) {
		if (interval) clearInterval(interval)
		seconds.next(0)
		interval = setInterval(() => { seconds.next(e => e + .5) }, 500)
	}
})
let time = memo(() => {
	const minutes = Math.floor(seconds.value() / 60);
	const second = seconds.value() - minutes * 60;

	return minutes + ':' + second

}, [seconds])
let minusc = e => e == 0 ? e : e - 1
let nextslide = () => {
	let old = slidenumber.value()
	slidenumber.next(e => e == slides.length - 1 ? e : e + 1)

	if (old != slidenumber.value()) doo(slides[slidenumber.value()])
}

let prevslide = () => {
	slidenumber.next(minusc)
	history.undo()
	// doo(slides[slidenumber.value()])
}

let betn = (txt, fn) => dom('button', { onclick: fn }, txt)

let doo = (cmds) => cmds.forEach(e => e())
let buttons = dom([
	'.controller.box',
	betn('next', nextslide),
	betn(slidenumber, () => console.log(slidenumber.value())),
	betn('prev', prevslide),
	betn(time, () => {})
])

let root = [".root", messages, designdispaly, designcaption, buttons]

let wrap = words => words.split(' ')
	.map((word) =>
		[".word", ...word.split('')
		 .map((letter) =>
			 ['span.letters.t' + ((Math.floor(Math.random() * 99999) % 8) + 1), letter])])

console.log('wrapped', wrap('alphabet word'))

let D = {
	main: (el) => () => dddisplay.next(el),
	caption: (el) => () => dcdisplay.next(el),
	clear: () => {
		D.main(empty)()
		D.caption(empty)()
	}
}

let randompos = () =>`
position: fixed;
top: ${Math.random() * 80}vh;
left: ${Math.random() * 80}vw;`

let empty = ['div']
let h1 = t => ['h1', ...wrap(t)]
let flash = t => ['h1.flash', ...wrap(t)]
let h2 = t => ['h2', ...wrap(t)]
let h3 = t => ['h3', ...wrap(t)]
let h4 = t => ['h4', ...wrap(t)]
let random = d => ['.random', {style: randompos()}, d]
let p = t => ['p', ...wrap(t)]
let video = t => ['video', { src: t, muted: true, autoplay: true, loop: true }]
let videof = t => ['video', { src: "./images/" + t + ".mp4", muted: true, autoplay: true, loop: true }]
let img = t => ['img', { onclick: e => {
	if (e.target.style.transform.includes('scale')) e.target.style.transform = ''
	else e.target.style.transform = 'scale(1.5)'
},src: t }]
let imgf = t => img("./images/" + t + ".png")
let imgfj = t => img( "./images/" + t + ".jpg")
let giff = t => ['img', { src: "./images/" + t + ".gif" }]
let light = t => ['span.light', ...wrap(t)]

let rerandom = () => document.querySelectorAll('.random')
		.forEach(e => e.style = randompos())

let up = () => document.querySelectorAll('.random')
		.forEach(e => e.style.top = parseInt(e.style.top) - 8 + 'vh')


let down = () => document.querySelectorAll('.random')
		.forEach(e => e.style.top = parseInt(e.style.top) + 8 + 'vh')

let left = () => document.querySelectorAll('.random')
		.forEach(e => e.style.left = parseInt(e.style.left) - 5 + 'vw')

let right = () => document.querySelectorAll('.random')
		.forEach(e => e.style.left = parseInt(e.style.left) + 5 + 'vw')


let build = (items, fn) => items.reduce((acc, item) => {
	acc.total.push(item)
	acc.slides.push(fn(acc.total))
	return acc
}, {
	total: [],
	slides: [],
}).slides

// ---------------------
// SLIDES
// ---------------------

let intro = [
	[D.clear],
	[D.caption(h1("DEMO TALK"))],
	[D.caption(h1("IF MACHINE WORKS"))],
	[D.main(videof('compiled'))],
	// ...build([
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS',
	// 	'IF MACHINE WORKS']
	// 				 .map(e => random(h4(e))),
	// 				 (total) => [D.main(['div', ...total])]
	// 				),
]

let historyoftools = [
	[D.clear],
	[D.caption(h1("HISTORY of DESIGN TOOLS"))],

	...build(
		[
			"history/history1",
			"history/history2",
			"history/history3",
			"history/history4",
			"history/history5",
			"history/history6",
			"history/history7",
			"history/history8",
		].map(e => random(imgf(e))), (total) =>
		[D.main(['div', ['.inactive', ...total.slice(0,-1)], total[total.length-1]])]),


	...build(["we are in a critical point in time?", "(well always are, we are always a in crsis in history)"]
					 .map(e => h4(e)),
					 (total) => [D.main(['div', ...total])]
					),

	...build(
		[
			"history/conventions",
			"diagrams/convention",
		].map(e => random(imgf(e))), (total) =>
		[D.main(['div', ['.inactive', ...total.slice(0,-1)], total[total.length-1]])]
	)
]

let softwarerevolution = [
	[D.clear],
	[D.caption(h1("The computer"))],

	...build(["craft and technological knowledge of design was shifted ",
						"   |   ",
						"   |   ",
						"   V   ",
						"to computer science and engineering"],
					 (total) => [D.main(['div', ...total.map(e => p(e))])]),

	...build(
		[
			"software/gap0",
			"software/gap1",
			"software/gap2",
			"software/gap3",
			"software/gap4",
			"software/gap5",
			"software/gap6",
		].map(e => random(imgf(e))), (total) =>
		[D.main(['div', ['.inactive', ...total.slice(0,-1)], total[total.length-1]])]
	),


]

let gapbetweendesign = [
	[D.clear],
	[
		D.caption(h1("Gap between design")),
	],

	...build(["there is this massive gap between the graphic design practice",
						"     |    ",
						"     v    ",
						"(as the known editorial, typographic, grid like practice)",
						"     |    ",
						"     v    ",
						"and the web graphics",
						"     |    ",
						"     v    ",
						"(as graphics to be utilized for artistic practices)"],
				(total) => [D.main(['div', ...total.map(e => p(e))])]),
	[D.main(imgfj('diagrams/gap'))]
]

let designer = [
	[D.clear],
	[D.caption(h1("Proficient in"))],
	[D.main(imgf('proficient/designer'))]
]

let webmaterial = [
	[D.clear],
	[D.caption(h1("Material of the web"))],
	...build(
		[
			"rgb/news",
			"rgb/tv",
		].map(e => random(imgf(e))), (total) =>
		[D.main(['div', ['.inactive', ...total.slice(0,-1)], total[total.length-1]])]
	),
	[D.main(imgfj("diagrams/material"))]
]

let diveintotools = [
	[D.clear],
	[D.caption(h1("TOOLS WE worked on"))],
	[D.main(h4("Show the tools and stuff"))]
]

let treatingcodecraft = [
	[D.clear],
	[D.caption(h1("Treating code as craft"))],
	[D.main(h1("OR..."))],
	[D.main(imgf("code/coding1"))]
]
let slides = [
	...intro,
	...historyoftools,
	...softwarerevolution,
	...gapbetweendesign,
	...designer,
	...webmaterial,
	...diveintotools,
	...treatingcodecraft
]

document.onkeydown = e => {
	if (e.key == 'ArrowLeft') prevslide()
	if (e.key == 'ArrowRight') nextslide()

	if (e.key == 'w') up()
	if (e.key == 'a') left()
	if (e.key == 'd') right()
	if (e.key == 's') down()
	if (e.key == 'r') rerandom()
}

document.body.appendChild(dom(root))
