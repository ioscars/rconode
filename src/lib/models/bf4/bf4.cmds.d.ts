export type BF4Commands =
  | "admin.eventsEnabled"
  | "admin.help"
  | "admin.kickPlayer"
  | "admin.killPlayer"
  | "admin.listPlayers"
  | "admin.movePlayer"
  | "admin.password"
  | "admin.say"
  | "admin.shutDown"
  | "admin.teamSwitchPlayer"
  | "admin.yell"
  | "banList.add"
  | "banList.clear"
  | "banList.list"
  | "banList.load"
  | "banList.remove"
  | "banList.save"
  | "currentLevel"
  | "fairFight.activate"
  | "fairFight.deactivate"
  | "fairFight.isActive"
  | "listPlayers"
  | "login.hashed"
  | "login.plainText"
  | "logout"
  | "mapList.add"
  | "mapList.availableMaps"
  | "mapList.clear"
  | "mapList.endRound"
  | "mapList.getMapIndices"
  | "mapList.getRounds"
  | "mapList.list"
  | "mapList.load"
  | "mapList.remove"
  | "mapList.restartRound"
  | "mapList.runNextRound"
  | "mapList.save"
  | "mapList.setNextMapIndex"
  | "player.idleDuration"
  | "player.isAlive"
  | "player.ping"
  | "punkBuster.activate"
  | "punkBuster.isActive"
  | "punkBuster.pb_sv_command"
  | "quit"
  | "reservedSlotsList.add"
  | "reservedSlotsList.aggressiveJoin"
  | "reservedSlotsList.clear"
  | "reservedSlotsList.list"
  | "reservedSlotsList.load"
  | "reservedSlotsList.remove"
  | "reservedSlotsList.save"
  | "serverInfo"
  | "spectatorList.add"
  | "spectatorList.clear"
  | "spectatorList.list"
  | "spectatorList.remove"
  | "spectatorList.save"
  | "squad.leader"
  | "squad.listActive"
  | "squad.listPlayers"
  | "squad.private"
  | "vars.3dSpotting"
  | "vars.3pCam"
  | "vars.alwaysAllowSpectators"
  | "vars.autoBalance"
  | "vars.bulletDamage"
  | "vars.commander"
  | "vars.forceReloadWholeMags"
  | "vars.friendlyFire"
  | "vars.gameModeCounter"
  | "vars.gamePassword"
  | "vars.gunMasterWeaponsPreset"
  | "vars.hitIndicatorsEnabled"
  | "vars.hud"
  | "vars.idleBanRounds"
  | "vars.idleTimeout"
  | "vars.idleTimeoutActiveMinPlayersPercent"
  | "vars.IsCompetitive"
  | "vars.IsNoobOnlyJoin"
  | "vars.killCam"
  | "vars.maxPlayers"
  | "vars.minimap"
  | "vars.miniMapSpotting"
  | "vars.mpExperience"
  | "vars.nameTag"
  | "vars.onlySquadLeaderSpawn"
  | "vars.outHighFrequency"
  | "vars.outHighFrequencyRconCap"
  | "vars.playerRespawnTime"
  | "vars.preset"
  | "vars.regenerateHealth"
  | "vars.roundLockdownCountdown"
  | "vars.roundPlayersReadyBypassTimer"
  | "vars.roundPlayersReadyMinCount"
  | "vars.roundPlayersReadyPercent"
  | "vars.roundRestartPlayerCount"
  | "vars.roundStartPlayerCount"
  | "vars.roundTimeLimit"
  | "vars.roundWarmupTimeout"
  | "vars.serverDescription"
  | "vars.serverMessage"
  | "vars.serverName"
  | "vars.serverTickTime"
  | "vars.serverType"
  | "vars.SkillBasedBalance"
  | "vars.soldierHealth"
  | "vars.teamFactionOverride"
  | "vars.teamKillCountForKick"
  | "vars.teamKillKickForBan"
  | "vars.teamKillValueDecreasePerSecond"
  | "vars.teamKillValueForKick"
  | "vars.teamKillValueIncrease"
  | "vars.ticketBleedRate"
  | "vars.unlockMode"
  | "vars.vehicleSpawnAllowed"
  | "vars.vehicleSpawnDelay"
  | "version";
