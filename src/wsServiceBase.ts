import * as log4js from "log4js";
import WebSocket from "ws";
import { WeatherForecastSettings } from "./types";

/**
 * WsServiceBase
 * Websocketサービスクラスの基底クラス
 */
export class WsServiceBase {
  // ロガー
  protected logger: log4js.Logger;
  // Websocket接続リトライ回数
  protected connCnt: number;
  // Websocket接続先URL
  readonly wsUrl: string;
  // Websocket接続リトライ回数上限
  readonly connLimit: number;
  // bot設定値
  readonly settings: WeatherForecastSettings;

  constructor(
    prmSettings: WeatherForecastSettings,
    prmLogger: log4js.Logger,
    prmWsUrl: string
  ) {
    this.settings = prmSettings;
    this.logger = prmLogger;
    this.wsUrl = prmWsUrl;
    this.connLimit = this.settings.misskey_account_setting.connect_retry_cnt;
    this.connCnt = 0;
  }

  /**
   * mainConnect
   * Websocket接続及び各種イベントハンドラ
   */
  public mainConnect(): void {
    const ws = new WebSocket(this.wsUrl);

    // 接続開始
    ws.on("open", () => {
      this.logger.info("コネクションOPEN");
      this.openEvent(ws);
    });

    // 受信検知
    ws.on("message", (data) => {
      this.logger.info("受信検知");
      this.receiveEvent(ws, data);
    });

    // 切断検知
    ws.on("close", () => {
      this.logger.info("切断検知");
      this.closeEvent(ws);
    });

    // エラー検知
    ws.on("error", () => {
      this.logger.info("エラー検知");
      this.errorEvent(ws);
    });
  }

  /**
   * openEvent
   * Websocket接続開始時イベント
   */
  protected openEvent(ws: WebSocket): void {
    // 子クラスで定義
  }

  /**
   * receiveEvent
   * Websocket受信時イベント
   */
  protected receiveEvent(ws: WebSocket, data: WebSocket.RawData): void {
    // 子クラスで定義
  }

  /**
   * closeEvent
   * Websocket切断検知時イベント
   */
  protected closeEvent(ws: WebSocket): void {
    // リトライ回数加算
    this.connCnt += 1;

    if (this.connCnt <= this.connLimit) {
      // リトライ回数が規定の上限以下であれば再接続
      this.logger.info("再接続リトライ…");
      this.mainConnect();
    } else {
      // 規定回数を超えた場合は切断して終了
      ws.close();
    }
  }

  /**
   * errorEvent
   * Websocketエラー検知時イベント
   */
  errorEvent(ws: WebSocket): void {
    this.logger.error("エラー検知。Websocket切断");
    ws.close();
  }
}
