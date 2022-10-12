import { filter, map, Subject } from "https://deno.land/x/rxjs@v1.0.2/mod.ts";
import Debug from "https://deno.land/x/debuglog@v1.0.0/debug.ts";
import { BF4Commands } from "./models/bf4/bf4.cmds.d.ts";
import { RconClient } from "./rcon.client.ts";
import * as rconUtils from "./utils/rcon.utils.ts";

const debug = Debug('RconBF4Api');
export class BF4Api {
  constructor(
    protected conn: RconClient,
  ) {}

  events = new Subject<string[]>();

  async login(pass: string) {
    await this.conn.connect();
    try {
      const [serverHash] = await this.exec("login.hashed");
      const hashPass = rconUtils.hashPassword(pass, serverHash);
      await this.exec("login.hashed", hashPass);
      debug('Login successful');
    } catch(e) {
      this.conn.disconnect();
      throw e;
    }
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

  adminKickPlayer(name: string) {
    return this.exec("admin.kickPlayer", name);
  }

  async adminEvents(enable: "true" | "false") {
    const reuslt = await this.exec("admin.eventsEnabled", enable);
    if (enable === 'true') {
      this.conn.on("event", this.processEvent);
    } else {
      this.conn.off("event", this.processEvent);
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

  squadLeader(teamId: string, squadId: string, soldierName = '') {
    return this.exec('squad.leader', teamId, squadId, soldierName);
  }

  mapListAvailableMaps(filter: 'perMap' | 'perGameMode') {
    return this.exec('mapList.availableMaps', filter);
  }

  mapList(startIndex: number) {
    return this.exec('mapList.list', startIndex.toString());
  }

  exec(cmd: BF4Commands, ...args: string[]) {
    return this.conn.exec([cmd, ...args]);
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
