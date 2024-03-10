import axios from "axios";
import * as log4js from "log4js";
import { MisskeyAPIRapper } from "./misskeyAPIWrapper";
import { RequestUrls } from "./types";

export class WeatherApiHandler {
  private logger: log4js.Logger;
  private misskeyApi: MisskeyAPIRapper;
  private requestUrls: RequestUrls;

  constructor(
    prmLogger: log4js.Logger,
    prmMisskeyApi: MisskeyAPIRapper,
    prmWeatherUrls: RequestUrls
  ) {
    this.logger = prmLogger;
    this.misskeyApi = prmMisskeyApi;
    this.requestUrls = prmWeatherUrls;
  }

  /**
   * getData
   * 受信したデータのハンドリング
   */
  public async getData(toid: string, code: string, prefNm: string) {
    try {
      this.logger.info("APIリクエスト開始");
      // 3日間概況
      const requestURLBase: string = this.requestUrls.overview_base_3days_url;
      const requestURL: string = requestURLBase.replace("{0}", code);

      // GET
      const response = await axios.get(requestURL);
      return response;
    } catch (error) {
      this.logger.error("APIリクエストでエラーが発生しました。");
    }
  }
}
