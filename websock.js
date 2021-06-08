String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
	return hash;
    }
    for (var i = 0; i < this.length; i++) {
	var char = this.charCodeAt(i);
	hash = ((hash<<5)-hash)+char;
	hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
var WsCons = {};

class WsPort {
    constructor(conname) {
	this.conname = conname;
	this.hash = this.conname.hashCode();
	if (this.hash in WsCons) {
	    console.log("exists allready");
	    return
	}
	this._ws = new WebSocket(conname);
	this._ws.addEventListener('message', (event) => {
	    let val;
	    try {
		val = event.data
	    } catch (e) {
		val = '';
	    } finally {
		console.log(`<--    ${val}`);
	    }
	});
	console.log(this.hash);
	WsCons[this.hash] = this;
	console.log("constructor done");
    }
    close() {
	delete WsCons[this.hash];
	this._ws.close();
    }
    isready() {
	var readyState = this._ws.readyState;
	console.log(readyState);
	return readyState;
    }
    send(message) {
	var readyState = this._ws.readyState;
	console.log(readyState);
	if (readyState == 1) {
	    this._ws.send(message);
	}
    }
}

class Scratch3WSBlocks {
    constructor(runtime) {
	this._runtime = runtime;
    }

    getInfo() {
	return {
	    id: 'WS',
	    name: 'WebSocket',
	    blocks: [
		{
		    opcode: 'commandSend',
		    text: 'WS send[con] [tx]',
		    blockType: Scratch.BlockType.COMMAND,
		    arguments: {
			con: {
			    type: Scratch.ArgumentType.String,
			},
			tx: {
			    type: Scratch.ArgumentType.STRING,
			    defaultValue: 'Hallo peter',
			}
		    }
		},
		{
		    opcode: 'commandConnect',
		    text: 'WS connect[url]',
		    blockType: Scratch.BlockType.REPORTER,
		    arguments: {
			url: {
			    type: Scratch.ArgumentType.STRING,
			    defaultValue: "ws://localhost:8000/",
			}
		    }
		},

		{
		    opcode: 'commandState',
		    text: 'WS state [con]',
		    blockType: Scratch.BlockType.REPORTER,
		    arguments: {
			con: {
			    type: Scratch.ArgumentType.String,
			}
		    }
		},
		{
		    opcode: 'commandClose',
		    text: 'WS close [con]',
		    blockType: Scratch.BlockType.COMMAND,
		    arguments: {
			con: {
			    type: Scratch.ArgumentType.String,
			}
		    }
		},
	    ], // blocks
	    menus: {
	    } // menus
	};
    } // getInfo()

    commandState(args) {
	var ws = WsCons[args.con]; //need check if not found
	return String(ws.isready())
    }

    commandClose(args) {
	var ws = WsCons[args.con]; //need check if not found
	ws.close();
    }

    commandConnect( args ) {
	console.log("Connect");
	var ws = new WsPort(args.url);
	let x = ws.hash
	console.log(x)
	return String(x);
    }

    commandSend( args ) {
	console.log("SEND");
	var ws = WsCons[args.con]; //need check if not found
	ws.send(`${args.tx}`);
    }
}

Scratch.extensions.register(new Scratch3WSBlocks());
