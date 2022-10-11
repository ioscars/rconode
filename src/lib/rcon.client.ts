import {
  EventEmitter,
  TCPClient,
  TCPEvents,
  ITCPEventData 
} from "https://deno.land/x/net@v1.1.2/src/mod.ts";
import { Buffer } from "https://deno.land/std@0.76.0/node/buffer.ts";

import { RconEncoder } from "./utils/rcon.encoder.ts";
import { RconMessage } from "./models/message.ts";
import { Deferred } from "./utils/deferred.ts";

class ErrorRconServer extends Error {}

export class RconClient extends EventEmitter {
  protected sock = new TCPClient();
  protected id = 0x3fffffff;
  protected buf = new Buffer();
  protected cbs = new Map<number, Deferred<any, ErrorRconServer>>();

  constructor(
    protected host: string,
    protected port: number,
    protected encoder = new RconEncoder(),
  ) {
    super();
  }

  async connect() {
    if (this.sock.connected) return;
    console.log('The rcon client is connecting');
    await this.sock.connect(this.host, this.port);
    this.sock.events.on(TCPEvents.RECEIVED_DATA, (e: ITCPEventData) =>  this._gather(e.data));
    this.sock.poll();
  }

  disconnect() {
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
      try {
        this._process(this.encoder.decode(data));
      } catch (err) {
        this.emit("error", err);
      }
    } while (true);
  }

  protected _process(msg: RconMessage) {
    if (msg.data.length === 0) {
      throw new ErrorRconServer("empty message received");
    }
    if (msg.isFromServer()) {
      this.emit("event", msg);
    } else {
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
    const deferred = new Deferred<T, ErrorRconServer>();
    this.cbs.set(msg.id, deferred);
    await this.sock.write(this.encoder.encode(msg));
    return deferred.promise;
  }
}
