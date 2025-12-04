export let setCSS = (k,v) => document.documentElement.style.setProperty(k,v);

let timeouts = []
let cmds = {
	outlineWidth: (c) => (
		setCSS("--outline-width", c+'px'),
		setCSS("--outline-width-negative", "-"+c+"px")),
	outlineColor: (c) => setCSS("--outline-color", c),
	blur: (c) => setCSS("--blur", c),
	logBlend: (c) => setCSS("--log-blend", c),
	color: (c) => setCSS("--color", c),
	commandLogSize: (c) => setCSS("--command-log-size", c),
	commandLogColor: (c) => setCSS("--command-log-color", c),
	highlight: (c) => setCSS("--highlight", c),
	background: (c) => setCSS("--background", c),
	fontFamily: (c) => {
		[1,2,3,4,5,6,7,8].forEach((e) => {
			setTimeout(() => {
				setCSS('--t' + e + '-font', c)
			}, e*150 + Math.random() * 50)
		})

	}
}

export let parse = cmdstr => {
	let split = cmdstr.split(":").map(e => e.trim())
	let cmd = split[0]
	let value = split[1]
	console.log('cmd', cmd, 'value', value, cmds[cmd])
	if (cmds[cmd]) return () => cmds[cmd](value)
	else return undefined
}

export let serialize = (cmd, value) => {
	return cmd + ':' + value
}
