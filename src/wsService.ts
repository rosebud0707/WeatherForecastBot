import * as log4js from "log4js";
import WebSocket from "ws";
import { v4 as uuidv4 } from "uuid";
import { PrefList } from "./types";
import { RequestUrls } from "./types";
import { ReceivedDataHandler } from "./receivedDataHandler";
import { MisskeyAPIRapper } from "./misskeyAPIWrapper";
import { ApiClientHandler } from "./apiClientHandler";

/**
 * WsService
 * Websocketサービスクラス
 */
export class WsService {
  // クラス変数
  // ロガー
  private logger: log4js.Logger;
  // Websocket関連
  private wsUrl: string;
  private connLimit: number;
  private connCnt: number;
  private uuid: string;
  private main_channel_send_json: object;
  // 天気情報取得用API関連
  private preflist: PrefList;
  private weatherUrls: RequestUrls;
  //MisskeyAPIラッパー
  private misskeyApi: MisskeyAPIRapper;

  constructor(
    prmUrl: string,
    prmLogger: log4js.Logger,
    prmPrefList: PrefList,
    prmConnLimit: number,
    prmMisskeyApi: MisskeyAPIRapper,
    prmWeatherUrls: RequestUrls
  ) {
    this.logger = prmLogger;
    this.wsUrl = prmUrl;
    this.connLimit = prmConnLimit;
    this.connCnt = 0;
    this.uuid = uuidv4();
    this.main_channel_send_json = {
      type: "connect",
      body: {
        channel: "main",
        id: this.uuid,
      },
    };
    this.preflist = prmPrefList;
    this.weatherUrls = prmWeatherUrls;
    this.misskeyApi = prmMisskeyApi;
  }

  /**
   * mainConnect
   * Websocket接続及び各種イベントハンドラを定義
   */
  public mainConnect(): void {
    const ws = new WebSocket(this.wsUrl);

    // 接続開始
    ws.on("open", () => {
      ws.send(JSON.stringify(this.main_channel_send_json));
      this.logger.info("WebSocket mainチャンネル接続");
      this.connCnt = 0;
    });

    // 受信検知
    ws.on("message", (data) => {
      this.logger.info("通知検知");

      // 受信データの確認、APIとの受け渡しを行うクラスのインスタンス化
      const apiClientHandler = new ApiClientHandler(
        this.logger,
        this.preflist,
        this.misskeyApi,
        this.weatherUrls
      );

      apiClientHandler.handlerMain(data);
    });

    // 切断検知
    ws.on("close", () => {
      this.logger.info("切断検知");
      // リトライ回数加算
      this.connCnt = this.connCnt + 1;

      if (this.connCnt <= this.connLimit) {
        // リトライ回数が規定の上限以下であれば再接続
        this.logger.info("再接続リトライ…");
        this.mainConnect();
      } else {
        // 規定回数を超えた場合は切断して終了
        ws.close();
        throw new Error("再接続失敗");
      }
    });

    // エラー検知
    ws.on("error", () => {
      this.logger.error("エラー検知 Websocket切断");
      ws.close();
      throw new Error("エラー発生");
    });
  }
}
