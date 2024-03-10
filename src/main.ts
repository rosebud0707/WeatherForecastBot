import * as log4js from "log4js";
import { WeatherForecastSettings } from "./types";
import { WsService } from "./wsService";
import { MisskeyAPIRapper } from "./misskeyAPIWrapper";

/**
 * Mainクラス
 */
export class Main {
  private configData: WeatherForecastSettings;
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
      // misskeyAPIラッパークラスのインスタンス化
      const misskeyApi = new MisskeyAPIRapper(
        this.configData.misskey_account_setting.domain_name,
        this.configData.misskey_account_setting.api_key
      );
      // Websocket接続URL
      const wsUrl: string =
        this.configData.misskey_account_setting.websocket_url.replace(
          "{token}",
          this.configData.misskey_account_setting.api_key
        );

      // Websocketサービスクラスインスタンス化
      const ws = new WsService(
        wsUrl,
        logger,
        this.configData.pref_list,
        this.configData.request_limit,
        misskeyApi,
        this.configData.request_urls
      );

      // Websocket接続
      ws.mainConnect();
    } catch (error) {
      logger.error("エラーが発生しました。", error);
    }
  }
}
