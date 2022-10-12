import { BaseModel } from "../base-model.ts";
import { IPlayerInfo } from "./declarations.d.ts";

export class PlayerInfo extends BaseModel implements IPlayerInfo {
  constructor(
    public name: string,
    public guid: string,
    public teamId: number,
    public squadId: number,
    public kills: number,
    public deaths: number,
    public score: number,
    public rank: number,
    public ping: number,
    public type: number,
  ) {
    super();
  }
}
