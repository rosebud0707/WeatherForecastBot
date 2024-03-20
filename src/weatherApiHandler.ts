import axios from "axios";
import * as log4js from "log4js";

export class WeatherApiHandler {
  private logger: log4js.Logger;

  constructor(prmLogger: log4js.Logger) {
    this.logger = prmLogger;
  }

  /**
   * getData
   * 受信したデータのハンドリング
   */
  public async getData(code: string, url: string) {
    try {
      this.logger.info("APIリクエスト開始");
      // 3日間概況
      const requestURLBase: string = url;
      const requestURL: string = requestURLBase.replace("{0}", code);

      // GET
      const response = await axios.get(requestURL);
      return response;
    } catch (error) {
      this.logger.error("APIリクエストでエラーが発生しました。");
    }
  }
}
