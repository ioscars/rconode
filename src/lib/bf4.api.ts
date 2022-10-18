import { TCPEvents } from "../deps/net.ts";
import { filter, map, Subject } from "../deps/rxjs.ts";
import d from "../deps/debug.ts";
import { BF4Commands } from "./models/bf4/bf4.cmds.d.ts";
import { RconClient } from "./rcon.client.ts";
import * as rconUtils from "./utils/rcon.utils.ts";
import { deferred } from "../deps/std.ts";

const debug = d('rconode:bf4api');
export class BF4Api {
  isLoggedIn = false;
  isAdminEvents = false;
  protected ready = deferred();
  protected events = new Subject<string[]>();

  constructor(
    protected conn: RconClient,
  ) {
    this.conn.on("event", this.processEvent);
  }

  async login(pass: string) {
    this.conn.sock.events.on(TCPEvents.CONNECT, () => this._login(pass));
    this.conn.sock.events.on(TCPEvents.DISCONNECT, () => this.isLoggedIn = false);
    await this.conn.connect();
    return this.ready;
  }

  protected async _login(pass: string) {
    this.isLoggedIn = false;
    try {
      const [serverHash] = await this.conn.exec("login.hashed");
      const hashPass = rconUtils.hashPassword(pass, serverHash);
      await this.conn.exec(["login.hashed", hashPass]);
      this.isLoggedIn = true;
      this.ready.resolve();
      debug('Login successful');
      this.ready = deferred();

      if (this.isAdminEvents) {
        await this.adminEvents('true');
      }
    } catch(e) {
      this.conn.disconnect();
      throw e;
    }
  }

  async exec(cmd: BF4Commands, ...args: string[]) {
    if (!this.isLoggedIn) {
      await this.ready;
    }
    return this.conn.exec([cmd, ...args]);
  }

  help() {
    return this.exec("admin.help");
  }

  version() {
    return this.exec("version");
  }

  async adminListPlayers() {
    const players = await this.exec("admin.listPlayers", "all");
    return rconUtils.tabulate(players, 0, rconUtils.zipPlayerInfo);
  }

  async serverInfo() {
    const info = await this.exec("serverInfo");
    return rconUtils.zipServerInfo(info);
  }

  adminKillPlayer(name: string) {
    return this.exec("admin.killPlayer", name);
  }

  adminKickPlayer(name: string, reason = '') {
    return this.exec("admin.kickPlayer", name, reason);
  }

  async adminEvents(enable: "true" | "false") {
    const reuslt = await this.exec("admin.eventsEnabled", enable);
    if (enable === 'true') {
      this.isAdminEvents = true;
    } else {
      this.isAdminEvents = false;
    }
    return reuslt;
  }

  adminMovePlayer(name: string, teamId: string, squadId: string, forceKill: "true" | "false" | "" = "") {
    return this.exec('admin.movePlayer', name, teamId, squadId, forceKill);
  }

  adminYell(msg: string, duration: number, playerSubset: string[]) {
    return this.exec('admin.yell', msg, duration.toString(), ...playerSubset);
  }

  adminSay(msg: string, playerSubset: string[]) {
    return this.exec('admin.say', msg, ...playerSubset);
  }

  async squadListActive(teamId: string) {
    const list = await this.exec('squad.listActive', teamId);
    return rconUtils.squadIds2squads(list);
  }

  squadLeader(teamId: number, squadId: number, soldierName = '') {
    return this.exec('squad.leader', teamId.toString(), squadId.toString(), soldierName);
  }

  mapListAvailableMaps(filter: 'perMap' | 'perGameMode') {
    return this.exec('mapList.availableMaps', filter);
  }

  mapList(startIndex: number) {
    return this.exec('mapList.list', startIndex.toString());
  }

  async currentLevel() {
    return (await this.exec('currentLevel'))[0];
  }

  processEvent = (event: { id: number; data: string[] }) => this.events.next(event.data);

  // Player Events
  onPlayerChat$ = this.events.pipe(
    filter((e) => e[0] === "player.onChat" && e[1] !== 'Server'),
    map((e) => ({ name: e[1], text: e[2], subset: e.slice(3) }))
  );
  onPlayerJoin$ = this.events.pipe(
    filter((e) => e[0] === "player.onJoin"),
    map((e) => ({ name: e[1], guid: e[2] }))
  );
  onPlayerSpawn$ = this.events.pipe(
    filter((e) => e[0] === "player.onSpawn"),
    map((e) => ({ name: e[1], team: e[2] }))
  );
  onPlayerLeave$ = this.events.pipe(
    filter((e) => e[0] === "player.onLeave"),
    map((e) => ({ name: e[1], info: rconUtils.tabulate(e, 2, rconUtils.zipPlayerInfo).rows[0] }))
  );
  onPlayerSquadChange$ = this.events.pipe(
    filter((e) => e[0] === "player.onSquadChange"),
    map((e) => ({ name: e[1], team: e[2], squad: e[3] }))
  );
  onPlayerTeamChange$ = this.events.pipe(
    filter((e) => e[0] === "player.onTeamChange"),
    map((e) => ({ name: e[1], team: e[2], squad: e[3] }))
  );
  onPlayerKill$ = this.events.pipe(
    filter((e) => e[0] === "player.onKill"),
    map((e) => ({ killer: e[1], victim: e[2], weapon: e[3], headshot: e[4] }))
  );

  // Server Events
  onServerLevelLoaded$ = this.events.pipe(
    filter((e) => e[0] === "server.onLevelLoaded"),
    map((e) => ({ name: e[1], modeName: e[2], roundNo: e[3], totalRouds: e[4] }))
  );
  onServerRoundOver$ = this.events.pipe(
    filter((e) => e[0] === "server.onRoundOver"),
    map((e) => ({ winningTeam: e[1] }))
  );
  onServerRoundOverPlayers$ = this.events.pipe(
    filter((e) => e[0] === "server.onRoundOverPlayers"),
    map((e) => ({ players: rconUtils.tabulate(e, 1) }))
  );

  onPunkBusterMessage$ = this.events.pipe(
    filter((e) => e[0] === "punkBuster.onMessage"),
    map((e) => ({ raw: e.slice(1) }))
  );
}
