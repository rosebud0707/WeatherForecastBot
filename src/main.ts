import * as log4js from "log4js";
import { WeatherForecastSettings } from "./types";
import { WsServiceMisskey } from "./wsServiceMisskey";

/**
 * Mainクラス
 */
export class Main {
  readonly configData: WeatherForecastSettings;
  private log4js;

  constructor(config: WeatherForecastSettings) {
    // 初期設定ファイルの設定
    this.configData = config;

    // ログ出力の設定
    this.log4js = log4js;
    this.log4js.configure({
      appenders: {
        logFile: {
          type: "file",
          filename:
            this.configData.log_setting.folder_path +
            this.configData.log_setting.file_name,
        },
      },
      categories: {
        default: {
          appenders: ["logFile"],
          level: this.configData.log_setting.log_level,
        },
      },
    });
  }

  /**
   * mainメソッド
   */
  public main(): void {
    // ログ インスタンス化
    const logger = this.log4js.getLogger();
    logger.info("bot起動");

    try {
      // Websocket接続URL
      const wsUrl: string =
        this.configData.misskey_account_setting.websocket_url
          .replace("{token}", this.configData.misskey_account_setting.api_key)
          .replace("{host}", this.configData.misskey_account_setting.host_name);

      // Websocketサービスクラスインスタンス化
      const ws = new WsServiceMisskey(this.configData, logger, wsUrl);

      // Websocket接続
      ws.mainConnect();
    } catch (error) {
      logger.error("エラーが発生しました。", error);
    }
  }
}
