import * as log4js from "log4js";
import { RawData } from "ws";
import { GetResponseSentence } from "./getResponseSentence";
import { WeatherForecastSettings } from "./types";
import { MisskeyAPIRapper } from "./misskeyAPIWrapper";
import { DatabaseHandler } from "./databaseHandler";

export class MisskeyBotInterface {
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
    // JSONオブジェクト化
    const receiveData = JSON.parse(data.toString());

    if (this.isNewMention(receiveData)) {
      // MisskeyAPIラッパー インスタンス化
      const misskeyApi = new MisskeyAPIRapper(
        this.settings.misskey_account_setting.domain_name,
        this.settings.misskey_account_setting.api_key
      );

      // DB接続クラス インスタンス化
      const dbConn = new DatabaseHandler(
        this.settings.db_setting.host,
        this.settings.db_setting.user,
        this.settings.db_setting.database_name,
        this.settings.db_setting.password,
        this.logger
      );

      try {
        // 送信者のID取得
        const toId: string = this.getUserId(receiveData);

        // 返信文言
        let responseSentence: string = "";

        // API問い合わせ回数の取得
        // DB接続
        await dbConn.dbConnect();
        const cntCheck = await dbConn.selectData(
          "SELECT count(*) AS CNT FROM wf_request_history where request_time > DATE_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 MINUTE);"
        );

        // 1分間にbotに対して規定以上のリクエストが行われていた場合、エラーとする。
        if (cntCheck[0].cnt > this.settings.request_limit) {
          responseSentence =
            "リクエスト上限数エラー。しばらく待ってから、再度お問い合わせください。";
        } else {
          // リクエスト履歴登録。
          const insSentence: string =
            "INSERT INTO wf_request_history(id, request_time, create_time) values('{0}',CURRENT_TIMESTAMP(),CURRENT_TIMESTAMP())";
          await dbConn.insUpdateData(insSentence.replace("{0}", toId));

          // bot宛のメンション本文を切り出す。
          const mention: string[] = this.getMention(receiveData);

          // 返信内容取得クラスのインスタンス化
          const getResponseSentence = new GetResponseSentence(
            this.logger,
            this.settings
          );

          // 天気概況取得処理
          responseSentence =
            await getResponseSentence.getResponseWeatherSentence(
              mention,
              this.settings.pref_list
            );
        }

        // 投稿
        misskeyApi.noteCreation("home", toId + responseSentence);
      } catch (error) {
        this.logger.error(error);
      } finally {
        dbConn.closeDbConnect();
      }
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
