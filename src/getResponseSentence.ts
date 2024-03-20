import * as log4js from "log4js";
import { PrefList } from "./types";
import { WeatherApiHandler } from "./weatherApiHandler";
import { WeatherForecastSettings } from "./types";

/**
 * GetResponseSentence
 * 受信したメンションを元に、返信文を取得する。
 */
export class GetResponseSentence {
  // クラス変数
  private logger: log4js.Logger;
  readonly configData: WeatherForecastSettings;

  constructor(prmLogger: log4js.Logger, prmSettings: WeatherForecastSettings) {
    this.logger = prmLogger;
    this.configData = prmSettings;
  }

  /**
   * getResponseWeatherSentence
   * 受信したメンションより、返信文(天気概況)を取得する。
   */
  public async getResponseWeatherSentence(
    mentions: string[],
    preflist: PrefList
  ): Promise<string> {
    // return値宣言
    let retResponseSentence: string = "";

    try {
      if ((mentions.length = 2)) {
        // @ID + 本文中に余分なスペースがない形式であれば処理
        // 本文を抜き出し
        const mention: string = mentions[1];
        // 正規表現パターンの生成
        const regexPatternBase = "^{prefNM}[都府県]?$";
        let vaildStatus: boolean = false;

        // 都道府県名リストより、本文が都道府県名のみ指定しているかチェック。
        for (const code in preflist) {
          // チェック中の都道府県名
          const prefNm = preflist[code];
          // 正規表現パターン化
          const regexPattern = regexPatternBase.replace("{prefNM}", prefNm);
          const regex = new RegExp(regexPattern);

          // 文字列チェック
          if (regex.test(mention)) {
            // パターン一致 APIリクエスト。
            vaildStatus = true;
            const weatherApiHandler = new WeatherApiHandler(this.logger);
            // 概況取得処理
            const response = await weatherApiHandler.getData(
              code,
              this.configData.request_urls.overview_base_3days_url
            );

            // ここはリターンコードで処理
            if (response !== undefined && response.status === 200) {
              retResponseSentence =
                "\n" + prefNm + "の天気概況です。\n" + response.data.text;
            } else {
              this.logger.error("APIリクエストエラー");
              retResponseSentence =
                "\n" + "天気情報取得処理でエラーが発生しました。";
            }
            break;
          }
        }
        // パターン不一致
        if (vaildStatus === false) {
          if (mention.includes("北海道")) {
            this.logger.warn("「北海道」入力エラー");
            retResponseSentence =
              "\n北海道については、次の地名をリプライしてください。\n「稚内」「旭川」「網走」「釧路」「胆振」「石狩」「函館」\n札幌は「石狩」に含まれます。";
          } else {
            this.logger.warn("メンションの形式エラー。");
            retResponseSentence =
              "\n都府県名(北海道の場合は「稚内」「旭川」「網走」「釧路」「胆振」「石狩」「函館」のいずれかの地名)のみをリプライしてください。\n✕：「大阪の天気を教えて」、「大阪　東京」\n○：「大阪」「大阪府」";
          }
        }
      } else {
        this.logger.warn("メンションの形式誤り");
        retResponseSentence =
          "県名のみをリプライしてください。✕：「大阪の天気を教えて」、「大阪　東京」　○：「大阪」「大阪府」";
      }
    } catch (error) {
      this.logger.error(
        "メンション形式チェック処理でエラーが発生しました。" + error
      );
    } finally {
      return retResponseSentence;
    }
  }
}
