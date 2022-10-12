# RCONode
## Usage
```ts
import { BF4Api, RconClient } from "../src/mod.ts";

async function main() {
  const rconClient = new RconClient('ipAddress', port);
  try {
    const bf4 = new BF4Api(rconClient);
    await bf4.login('password');

    const serverInfo = await bf4.serverInfo();
    console.log('serverInfo', serverInfo);

    bf4.onPlayerKill$.subscribe(e => console.log('onPlayerKill', e));
    await bf4.adminEvents('true');

  } catch (e) {
    console.error(e);
    rconClient.disconnect();
  }
}

main();
```
For debug run your app
```
DEBUG=* deno run --allow-env --allow-net app.ts
```