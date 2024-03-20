import * as log4js from "log4js";
import WebSocket from "ws";
import { WeatherForecastSettings } from "./types";
import { v4 as uuidv4 } from "uuid";
import { WsServiceBase } from "./wsServiceBase";
import { MisskeyBotHnadler } from "./misskeyBotHnadler";

/**
 * WsServiceMisskey
 * MisskeyとWebSocketで接続するクラス
 */
export class WsServiceMisskey extends WsServiceBase {
  private uuid: string;
  private main_channel_send_json: object;

  constructor(
    prmSettings: WeatherForecastSettings,
    prmLogger: log4js.Logger,
    prmWsUrl: string
  ) {
    super(prmSettings, prmLogger, prmWsUrl);
    // Misskey Websocket接続時 送信JSON
    this.uuid = uuidv4();
    this.main_channel_send_json = {
      type: "connect",
      body: {
        channel: "main",
        id: this.uuid,
      },
    };
  }

  /**
   * openEvent
   * Misskey Websocket Mainチャンネル接続
   */
  protected openEvent(ws: WebSocket): void {
    this.logger.info("コネクション オープン");

    ws.send(JSON.stringify(this.main_channel_send_json));
    this.logger.info("WebSocket mainチャンネル接続");
    this.connCnt = 0;
  }

  /**
   * receiveEvent
   * 受信処理
   */
  protected receiveEvent(ws: WebSocket, data: WebSocket.RawData): void {
    const misskeyBotHandler = new MisskeyBotHnadler(this.settings, this.logger);
    misskeyBotHandler.weatherForecastMain(data);
  }
}
