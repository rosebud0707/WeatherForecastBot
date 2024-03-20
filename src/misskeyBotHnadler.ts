import * as log4js from "log4js";
import { RawData } from "ws";
import { GetResponseSentence } from "./getResponseSentence";
import { WeatherForecastSettings } from "./types";
import { MisskeyAPIRapper } from "./misskeyAPIWrapper";

export class MisskeyBotHnadler {
  // ロガー
  private logger: log4js.Logger;
  private settings: WeatherForecastSettings;

  constructor(prmSettings: WeatherForecastSettings, prmLogger: log4js.Logger) {
    this.settings = prmSettings;
    this.logger = prmLogger;
  }

  /**
   * weatherForecastMain
   * 新着のメンションより天気概況を取得し、その結果を投稿する。
   */
  public async weatherForecastMain(data: RawData) {
    const receiveData = JSON.parse(data.toString());
    if (this.isNewMention(receiveData)) {
      // 送信者のID取得
      const toId: string = this.getUserId(receiveData);
      // bot宛のメンション本文を切り出す。
      const mention: string[] = this.getMention(receiveData);

      // 返信内容取得クラスのインスタンス化
      const getResponseSentence = new GetResponseSentence(
        this.logger,
        this.settings
      );

      // 天気概況取得処理
      const responseSentence: string =
        await getResponseSentence.getResponseWeatherSentence(
          mention,
          this.settings.pref_list
        );

      const misskeyApi = new MisskeyAPIRapper(
        this.settings.misskey_account_setting.domain_name,
        this.settings.misskey_account_setting.api_key
      );

      // 投稿
      misskeyApi.noteCreation("home", toId + responseSentence);
    }
  }

  /**
   * isNewMention
   * 新着のメンションか否かを判断する
   */
  private isNewMention(receiveData: any): boolean {
    if (
      receiveData.body.type === "unreadNotification" &&
      (receiveData.body.body.type === "mention" ||
        receiveData.body.body.type === "reply")
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * getUserId
   * リプライ送付者のIDを取得する。
   */
  private getUserId(receiveData: any): string {
    // IDを取得する。
    let userId: string = "@" + receiveData.body.body.user.username;

    // 他サーバのユーザの場合、サーバホスト名も連結する。
    if (receiveData.body.body.user.host !== null) {
      userId = userId + "@" + receiveData.body.body.user.host;
    }

    return userId;
  }

  /**
   * getMention
   * メンション内容を取得する。
   */
  private getMention(receiveData: any): string[] {
    const mention_raw: string = receiveData.body.body.note.text;
    const mention: string[] = mention_raw.split(/\s+/);
    return mention;
  }
}
