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
	this.rxque = [];
	this.txresolve = 0;
	this.openresolve = 0;
	this._ws = new WebSocket(conname);
	this._ws.addEventListener('open', (event) => {
	    if (this.openresolve != 0) {
		console.log("open fire");
		this.openresolve(this.hash);
		this.openresolve = 0;
	    }
	});
	this._ws.addEventListener('message', (event) => {
	    let val;
	    try {
		val = event.data
	    } catch (e) {
		val = '';
	    } finally {
		console.log(`ws rx:  ${val}`);
		if (this.txresolve != 0) {
		    this.txresolve(val);
		    this.txresolve = 0;
		}
		else {
		    this.rxque.push(val);
		}
	    }
	});
	WsCons[this.hash] = this;
    }

    waitcon() {
	var that = this;
	if (this._ws.readyState == 0) {
	    console.log("need startup promise");
	    return new Promise((resolve, reject) => {
		that.openresolve = resolve;
		setTimeout(() => {
		    console.log("stratup timeout");
		    if (that.openresolve == 0)
			return;
		    console.log("stratup timeout failed");

		    that.openresolve = 0;
		    resolve('timeout');
		    that.close();
		}, 2000);
	    });
	}
	return this.hash;
    }

    getmsg() {
	var that = this;
	if (this.rxque.length == 0) {
		return new Promise((resolve, reject) => {
		    that.txresolve = resolve;
		    setTimeout(() => {
			if (that.txresolve == 0)
			    return;
			that.txresolve = 0;
			resolve('timeout');
		    }, 60000);
		});
	}
	return this.rxque.shift();
    }

    close() {
	delete WsCons[this.hash];
	this._ws.close();
	if (this.txresolve != 0) {
	    this.txresolve("CLOSED");
	    this.txresolve = 0;
	}
	if (this.openresolve != 0) {
	    this.openresolve("CLOSED");
	    this.openresolve = 0;
	}
    }

    send(message) {
	var readyState = this._ws.readyState;
	if (readyState == 1) {
	    this._ws.send(message);
	}
	else
	    console.log("ws try send but broken");
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
			    defaultValue: 'Hallo Peter',
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
		    opcode: 'commandClose',
		    text: 'WS close [con]',
		    blockType: Scratch.BlockType.COMMAND,
		    arguments: {
			con: {
			    type: Scratch.ArgumentType.String,
			}
		    }
		},
		{
		    opcode: 'getmessage',
		    text: 'WS receive [con]',
		    blockType: Scratch.BlockType.REPORTER,
		    arguments: {
			con: {
			    type: Scratch.ArgumentType.String,
			}
		    }
		}
	    ], // blocks
	    menus: {
	    } // menus
	};
    } // getInfo()

    getmessage(args) {
	if (args.con in WsCons) {
	    var ws = WsCons[args.con];
	    return ws.getmsg();
	}
	return String("does not exist");
    }

    commandState(args) {
	if (args.con in WsCons) {
	    var ws = WsCons[args.con];
	    return String(ws.isready())
	}
	return -1;
    }

    commandClose(args) {
	if (args.con in WsCons) {
	    var ws = WsCons[args.con];
	    ws.close();
	}
    }

    commandConnect( args ) {
	var ws = new WsPort(args.url);
	return ws.waitcon();
    }

    commandSend( args ) {
	if (args.con in WsCons) {
	    var ws = WsCons[args.con]; //need check if not found
	    ws.send(`${args.tx}`);
	}
    }
}

Scratch.extensions.register(new Scratch3WSBlocks());
