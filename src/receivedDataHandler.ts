import * as log4js from "log4js";
import { PrefList } from "./types";
import { WeatherApiHandler } from "./weatherApiHandler";
import { MisskeyAPIRapper } from "./misskeyAPIWrapper";
import { RequestUrls } from "./types";

/**
 * ReceivedDataHandler
 * 受信したデータのハンドリング
 */
export class ReceivedDataHandler {
  // クラス変数
  private logger: log4js.Logger;
  private misskeyApi: MisskeyAPIRapper;
  private weatherUrls: RequestUrls;

  constructor(
    prmLogger: log4js.Logger,
    prmMisskeyApi: MisskeyAPIRapper,
    prmWeatherUrls: RequestUrls
  ) {
    this.logger = prmLogger;
    this.misskeyApi = prmMisskeyApi;
    this.weatherUrls = prmWeatherUrls;
  }

  /**
   * handleData
   * 受信したデータのハンドリング
   */
  public handleData(
    toId: string,
    mentions: string[],
    prefList: PrefList
  ): void {
    try {
      if ((mentions.length = 2)) {
        // @ID + 本文形式であれば処理
        const mention: string = mentions[1];

        this.checkMention(toId, mention, prefList);
      } else {
        this.logger.warn("メンションの形式誤り");
        this.misskeyApi.noteCreation(
          "home",
          toId +
            " " +
            "県名のみをリプライしてください。✕：「大阪の天気を教えて」、「大阪　東京」　○：「大阪」「大阪府」",
          undefined
        );
      }
    } catch (error) {
      this.logger.error(error);
      throw new Error();
    }
  }

  /**
   * checkMention
   * メンション内容が規定通りかをチェックし、規定どおりであればAPIの呼び出しを行う。
   * TODO:チェックといいながらリクエストを投げて結果noteまでしてるので、要リファクタリング
   */
  private async checkMention(
    toId: string,
    mention: string,
    preflist: PrefList
  ) {
    try {
      const regexPatternBase = "^{prefNM}[都府県]?$";
      let vaildStatus: boolean = false;

      for (const code in preflist) {
        // チェック中の都道府県名
        const prefNm = preflist[code];
        // 正規表現パターン化
        const regexPattern = regexPatternBase.replace("{prefNM}", prefNm);
        const regex = new RegExp(regexPattern);

        // 文字列チェック
        if (regex.test(mention)) {
          // パターン一致
          vaildStatus = true;
          const weatherApiHandler = new WeatherApiHandler(
            this.logger,
            this.misskeyApi,
            this.weatherUrls
          );
          // 概況取得処理
          const response = await weatherApiHandler.getData(toId, code, prefNm);
          // const response = await this.getData(toId, code, prefNm);

          if (response !== undefined) {
            this.misskeyApi.noteCreation(
              "home",
              toId + "\n" + prefNm + "の天気概況です。\n" + response.data.text,
              undefined
            );
          } else {
            this.logger.error("APIリクエストエラー");
            this.misskeyApi.noteCreation(
              "home",
              toId + "\n" + "天気情報取得処理でエラーが発生しました。",
              undefined
            );
          }
          break;
        }
      }
      // パターン不一致
      if (vaildStatus === false) {
        if (mention.includes("北海道")) {
          this.logger.warn("「北海道」を入力エラー");
          this.misskeyApi.noteCreation(
            "home",
            toId +
              "\n北海道については、次の地名をリプライしてください。\n「稚内」「旭川」「網走」「釧路」「胆振」「石狩」「函館」\n札幌は「石狩」に含まれます。",
            undefined
          );
        } else {
          this.logger.warn("メンションの形式エラー。");
          this.misskeyApi.noteCreation(
            "home",
            toId +
              "\n都府県名(北海道の場合は「稚内」「旭川」「網走」「釧路」「胆振」「石狩」「函館」のいずれかの地名)のみをリプライしてください。\n✕：「大阪の天気を教えて」、「大阪　東京」\n○：「大阪」「大阪府」",
            undefined
          );
        }
      }
    } catch (error) {
      this.logger.error(
        "メンション形式チェック処理でエラーが発生しました。" + error
      );
    }
  }
}
