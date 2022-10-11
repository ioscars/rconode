import { filter, map, Subject } from "https://deno.land/x/rxjs@v1.0.2/mod.ts";
import { BF4Commands } from "./models/bf4/bf4.cmds.d.ts";
import { IPlayer } from "./models/bf4/declarations.d.ts";
import { RconClient } from "./rcon.client.ts";
import * as rconUtils from "./utils/rcon.utils.ts";

export class BF4Api {
  constructor(
    protected conn: RconClient,
  ) {}

  events = new Subject<string[]>();

  async login(pass: string) {
    await this.conn.connect();
    console.log('The bf4 api is logging');
    try {
      const [serverHash] = await this.exec("login.hashed");
      const hashPass = rconUtils.hashPassword(pass, serverHash);
      await this.exec("login.hashed", hashPass);
      this.conn.on("event", (e) => this.events.next(e.data));
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
    return rconUtils.tabulate<IPlayer>(players);
  }

  async serverInfo() {
    const i = await this.exec("serverInfo");
    let s = 0;
    return {
      serverName: i[s++], players: +i[s++], maxPlayers: +i[s++],
      gamemode: i[s++], map: i[s++], roundsPlayed: +i[s++],
      roundsTotal: i[s++], teamScores: rconUtils.getTeamScore(i, 7, s += +i[7] + 2), onlineState: i[s++],
      ranked: i[s++], punkBuster: i[s++], hasGamePassword: i[s++],
      serverUpTime: +i[s++], roundTime: +i[s++], gameIpAndPort: i[s++],
      punkBusterVersion: i[s++], joinQueueEnabled: i[s++], region: i[s++],
      closestPingSite: i[s++], matchMakingEnabled: i[s++], blazePlayerCount: i[s++],
      blazeGameState: i[s++]
    };
  }

  adminKillPlayer(name: string) {
    return this.exec("admin.killPlayer", name);
  }

  adminKickPlayer(name: string) {
    return this.exec("admin.kickPlayer", name);
  }

  adminEvents(enable: "true" | "false" | "" = "") {
    return this.exec("admin.eventsEnabled", enable);
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
    map((e) => ({ name: e[1], info: rconUtils.tabulate(e, 2).rows[0] }))
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
