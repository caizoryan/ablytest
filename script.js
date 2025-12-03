import { dawg } from './final.js'
import { reactive, memo } from './hok.js'
import { dom } from './dom.js'
import { parse, serialize } from './cmd.js'
let messages = dom('.messages')
async function publishSubscribe() {
  // Connect to Ably with your API key
  const ably = new dawg.Ably.Realtime("f8JcZg.XRPrxA:MdTyXnycB5ahByz--1CIY0-BMFLvLBIz8cSMgS6vTNM")
  ably.connection.once("connected", () => {console.log("Connected to Ably!")})

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
	if (slidenumber.value() == 0){
		if (interval) clearInterval(interval)
		seconds.next(0)
		interval=setInterval(() => {seconds.next(e => e+.5)}, 500)
	}
})
let time = memo(()=> {
	const minutes = Math.floor(seconds.value() / 60);
	const second = seconds.value() - minutes * 60;

	return minutes + ':' + second

}, [seconds])
let minusc = e => e == 0 ? e : e-1
let nextslide = () => {
	let old = slidenumber.value()
	slidenumber.next(e => e == slides.length-1 ? e : e+1)

	if (old != slidenumber.value()) doo(slides[slidenumber.value()])
}

let prevslide = () => {
	slidenumber.next(minusc)
	history.undo()
	// doo(slides[slidenumber.value()])
}

let betn = (txt, fn) => dom('button' ,{onclick: fn}, txt)

let doo = (cmds) => cmds.forEach(e => e()) 
let buttons = dom([
	'.controller.box',
	betn('next', nextslide),
	betn(slidenumber, () => console.log(slidenumber.value())  ),
	betn('prev', prevslide),
	betn(time, () => {})
])

let root = [".root",messages, designdispaly, designcaption, buttons]

let wrap = words => words.split(' ')
		.map((word, i) =>
			[".word", ...(word.split('').map((letter, ii) =>
				['span.letters.t' + (((ii+1)*(i+1) % 8) + 1), letter]))])

console.log('wrapped', wrap('alphabet word'))

let display= {
	dd: (el) => () => dddisplay.next(el),
	dc: (el) => () => dcdisplay.next(el),
	clear : () => {
		display.cd(empty)()
		display.dd(empty)()
		display.cc(empty)()
		display.dc(empty)()
	}
}

let empty = ['div']
let h1 = t => ['h1', wrap(t)]
let flash = t => ['h1.flash', wrap(t)]
let h2 = t => ['h2', wrap(t)]
let h3 = t => ['h3', wrap(t)]
let h4 = t => ['h4', wrap(t)]
let p = t => ['p', wrap(t)]
let video = t => ['video', {src: t, muted: true, autoplay: true, loop: true }]
let videof = t => ['video', {src: "./images/" +t+".mp4", muted: true, autoplay: true, loop: true }]
let img = t => ['img', {src: t}]
let imgf = t => ['img', {src:"./images/" +t+".png"}]
let imgfj = t => ['img', {src:"./images/" +t+".jpeg"}]
let giff = t => ['img', {src:"./images/" +t+".gif"}]
let light = t => ['span.light', wrap(t)]


let build = (items, fn) => items.reduce((acc, item) => {
	acc.total.push(item)
	acc.slides.push(fn(acc.total))
	return acc
}, {
	total: [],
	slides:[],
}).slides

// ---------------------
// SLIDES
// ---------------------

let slides = [
	[display.dd(h2("YO"))],
	[display.dd(h2("Another slide"))],
	[display.dd(h2("Another slide"))],
]
document.onkeydown = e => {
	if (e.key == 'ArrowLeft') prevslide()
	if (e.key == 'ArrowRight') nextslide()
}
document.body.appendChild(dom(root))
