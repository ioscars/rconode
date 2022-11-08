import { EventEmitter, TCPClient, TCPEvents, ITCPEventData } from "../deps/net.ts";
import { Buffer, Deferred, deferred, delay } from "../deps/std.ts";
import d from "../deps/debug.ts";

import { RconEncoder } from "./utils/rcon.encoder.ts";
import { RconMessage } from "./models/message.ts";

class ErrorRconServer extends Error {}

const debug = d('rconode:client');
export class RconClient extends EventEmitter {
  sock = new TCPClient();
  protected id!: number;
  protected buf!: Buffer;
  protected cbs!: Map<number, Deferred<string[]>>;
  protected ready = deferred();

  constructor(
    protected host: string,
    protected port: number,
    protected isAutoReconnect = true,
    protected encoder = new RconEncoder(),
  ) {
    super();

    this.sock.events.on(TCPEvents.RECEIVED_DATA, (e: ITCPEventData) =>  this._gather(e.data));
    this.sock.events.on(TCPEvents.CONNECT, () => { this.init(); this.sock.poll(); });
    this.sock.events.on(TCPEvents.DISCONNECT, () => debug('Disconnected'));
    this.sock.events.on(TCPEvents.ERROR, () => this.isAutoReconnect && this.reconnect());
  }

  protected init() {
    this.id = 0x3fffffff;
    this.buf = new Buffer();
    this.cbs = new Map<number, Deferred<string[]>>();
    this.ready = deferred();
  }

  async connect() {
    await this.sock.connect(this.host, this.port);
    debug(`Connected to ${this.host}:${this.port}`);
    this.ready.resolve();
  }

  async reconnect() {
    debug('Reconnect');
    await delay(1000);
    await this.connect();
  }

  disconnect() {
    this.isAutoReconnect = false;
    return this.sock.close();
  }

  protected _gather(chunk: Uint8Array) {
    this.buf = Buffer.concat([this.buf, chunk]);
    do {
      if (this.buf.length < 8) return;
      const size = this.buf.readUInt32LE(4);
      if (this.buf.length < size) return;
      const data = this.buf.slice(0, size);
      this.buf = this.buf.slice(size, this.buf.length);
      this._process(this.encoder.decode(data));
    } while (true);
  }

  protected _process(msg: RconMessage) {
    if (msg.data.length === 0) {
      throw new ErrorRconServer("Empty message received");
    }
    if (msg.isFromServer()) {
      debug(`[${msg.id}] Received event: ${msg.data[0]}`);
      this.emit("event", msg);
    } else {
      debug(`[${msg.id}] Received message: ${msg.data[0]}`);
      this.emit("message", msg);
      if (this.cbs.has(msg.id)) {
        const cbs = this.cbs.get(msg.id);
        if (msg.data[0] === "OK") {
          cbs!.resolve(msg.data.slice(1));
        } else {
          cbs!.reject(new ErrorRconServer(msg.data.join(" ")));
        }
        this.cbs.delete(msg.id);
      }
    }
  }

  public async exec<T extends string[]>(cmd: string | string[]) {
    const msg = new RconMessage(this.id, 0, cmd);
    this.id = (this.id + 1) & 0x3fffffff;
    const dfrd = deferred<T>();
    this.cbs.set(msg.id, dfrd);
    if (!this.sock.connected) {
      await this.ready;
    }

    await this.sock.write(this.encoder.encode(msg));
    debug(`[${msg.id}] Sent message: ${cmd[0]}`);
    return dfrd;
  }
}
