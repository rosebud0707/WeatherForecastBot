import { WeatherForecastSettings } from "./types";
import * as fs from "fs";
import * as path from "path";

/**
 * SetConfig
 * 外部設定ファイルを読み込む。
 */
export class SetConfig {
  private configData: WeatherForecastSettings;

  constructor() {
    this.configData = this.readConfig();
  }

  private readConfig(): WeatherForecastSettings {
    try {
      // 絶対パスを生成
      const configPath: string = path.join(__dirname, "../config.json");

      const rawData = fs.readFileSync(configPath, "utf8");
      return JSON.parse(rawData) as WeatherForecastSettings;
    } catch (error) {
      console.error("外部ファイル読み込みエラー。", error);
      throw new Error("外部ファイル読み込みエラー。");
    }
  }

  public getConfigData(): WeatherForecastSettings {
    return this.configData;
  }
}
