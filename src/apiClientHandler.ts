import * as log4js from "log4js";
import { RawData } from "ws";
import { PrefList } from "./types";
import { RequestUrls } from "./types";
import { ReceivedDataHandler } from "./receivedDataHandler";
import { MisskeyAPIRapper } from "./misskeyAPIWrapper";

export class ApiClientHandler {
  // ロガー
  private logger: log4js.Logger;
  // 天気情報取得用API関連
  private preflist: PrefList;
  private weatherUrls: RequestUrls;
  //MisskeyAPIラッパー
  private misskeyApi: MisskeyAPIRapper;

  constructor(
    prmLogger: log4js.Logger,
    prmPrefList: PrefList,
    prmMisskeyApi: MisskeyAPIRapper,
    prmWeatherUrls: RequestUrls
  ) {
    this.logger = prmLogger;
    this.preflist = prmPrefList;
    this.weatherUrls = prmWeatherUrls;
    this.misskeyApi = prmMisskeyApi;
  }

  public handlerMain(data: RawData) {
    // 受信したデータをオブジェクト化
    this.logger.info("通知検知");
    const receiveData = JSON.parse(data.toString());

    if (
      receiveData.body.type === "unreadNotification" &&
      (receiveData.body.body.type === "mention" ||
        receiveData.body.body.type === "reply")
    ) {
      // 受信したデータが未読かつメンションまたはリプライの場合のみ反応
      // bot宛のメンションを切り出す。
      const mention_raw: string = receiveData.body.body.note.text;
      const mention: string[] = mention_raw.split(/\s+/);
      // 返信先ID
      let toId: string = "@" + receiveData.body.body.user.username;
      if (receiveData.body.body.user.host !== null) {
        toId = toId + "@" + receiveData.body.body.user.host;
      }

      // データハンドラのインスタンス化
      const recvDataHandler = new ReceivedDataHandler(
        this.logger,
        this.misskeyApi,
        this.weatherUrls
      );

      // データ処理
      recvDataHandler.handleData(toId, mention, this.preflist);
    }
  }
}
