import { Buffer } from "../../deps/std.ts";
import { RconMessage } from "../models/message.ts";

export class RconEncoder {
  decode(buf: Buffer) {
    const head = buf.readUInt32LE(0),
      id = head & 0x3fffffff,
      flags = (head >> 30) & 0x3,
      dataLength = buf.readUInt32LE(8),
      data = [];
    let offset = 12;

    for (let i = 0; i < dataLength; i++) {
      const len = buf.readUInt32LE(offset);
      offset += 4;
      data.push(buf.slice(offset, offset + len).toString('utf-8'));
      offset += len + 1;
    }

    return new RconMessage(id, flags, data);
  }

  encode(msg: RconMessage) {
    const bufData = [];
    let dataLenth = 0;
    for (let i = 0; i < msg.data.length; i++) {
      const word = Buffer.from(msg.data[i], "utf-8");
      const part = new Buffer(word.length + 5);
      part.writeUInt32LE(word.length, 0);
      word.copy(part, 4);
      part.writeUInt8(0x00, part.length - 1);
      bufData.push(part);
      dataLenth += part.length;
    }
    const buf = new Buffer(dataLenth + 12);
    buf.writeUInt32LE(((msg.flags << 30) & 0xC0000000) | (msg.id & 0x3fffffff), 0);
    buf.writeUInt32LE(buf.length, 4);
    buf.writeUInt32LE(bufData.length, 8);
    Buffer.concat(bufData).copy(buf, 12);
    return buf;
  }
}
