import { Buffer } from "https://deno.land/std@0.76.0/node/buffer.ts";
import { Md5 } from "https://deno.land/std@0.159.0/hash/md5.ts?s=Md5";
import { squadNames } from "../models/bf4/squads.names.ts";
import { PlayerInfo } from "../models/bf4/player-info.ts";

export function parseBool(value: string) {
  return value === 'true';
}

export function zipObject<T>(values: string[], keys: string[]): T {
  const entity: any = {};
  for (let j = 0; j < keys.length; j++) {
    entity[keys[j]] = values[j];
  }
  return entity;
}

export function zipPlayerInfo(v: string[], _: string[]) {
  return new PlayerInfo(v[0], v[1], +v[2], +v[3], +v[4], +v[5], +v[6], +v[7], +v[8], +v[9]);
}

export function zipServerInfo(v: string[]) {
  let i = 0;
  return {
    serverName: v[i++], players: +v[i++], maxPlayers: +v[i++],
    gamemode: v[i++], map: v[i++], roundsPlayed: +v[i++],
    roundsTotal: +v[i++], teamScores: getTeamScore(v, 7, i += +v[7] + 2), onlineState: v[i++],
    ranked: parseBool(v[i++]), punkBuster: parseBool(v[i++]), hasGamePassword: parseBool(v[i++]),
    serverUpTime: +v[i++], roundTime: +v[i++], gameIpAndPort: v[i++],
    punkBusterVersion: v[i++], joinQueueEnabled: parseBool(v[i++]), region: v[i++],
    closestPingSite: v[i++], matchMakingEnabled: v[i++], blazePlayerCount: +v[i++],
    blazeGameState: v[i++]
  };
}

export function tabulate<R> (
  res: string[],
  offset = 0,
  reviver: (v: string[], k: string[]) => R = zipObject,
): { rows: R[]; cols: string[] } {
  const nColumns = parseInt(res[offset], 10);
  const cols = [];
  let i;
  for (i = offset + 1; i <= nColumns; i++) {
    cols.push(res[i]);
  }
  i += offset;
  const nRows = parseInt(res[i], 10);
  const rows = new Array<R>();
  for (let n = i + 1; n < res.length; n += nColumns) {
    const row = res.slice(n, n + nColumns);
    rows.push(reviver(row, cols));
  }

  return {
    rows,
    cols,
  };
}

export function getTeamScore(args: string[], offset = 0, t = 0) {
  const entities = +args[offset];
  const scores = [];
  for (let i = 1; i < entities + 1; i++) {
    scores.push(+args[offset + i]);
  }
  return {
    scores,
    targetScore: +args[offset + entities + 1],
  };
}

export function hashPassword(password: string, serverHash: string) {
  const md = new Md5();
  const md5Pass = md
    .update(Buffer.from(serverHash, "hex"))
    .update(Buffer.from(password, "utf-8"))
    .digest();
  return Buffer.from(md5Pass).toString("hex").toLocaleUpperCase();
}

export function squadIds2squads(squadIds: string[]) {
  return squadIds.map((sId) => ({ id: sId, name: squadNames[+sId] }));
}
