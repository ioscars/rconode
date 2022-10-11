export class RconMessage {
  static FLAGS = { RESPONSE: 0x01, FROMSERVER: 0x02 };

  id: number;
  flags: number;
  data: string[];

  constructor(id: number, flags: number, data: string | string[]) {
    this.id = id & 0x3fffffff;
    this.flags = flags & 0x3;
    this.data = typeof data === "string" ? data.split(" ") : data;
  }

  isResponse() {
    return (this.flags & RconMessage.FLAGS.RESPONSE) ===
      RconMessage.FLAGS.RESPONSE;
  }

  isFromServer() {
    return (this.flags & RconMessage.FLAGS.FROMSERVER) ===
      RconMessage.FLAGS.FROMSERVER;
  }
}
