import { SetConfig } from "./setConfig";
import { Main } from "./main";

console.log("WeatherForecastBot");
console.log("ver1.02");
console.log("Starting. . .");

// 初期設定ファイルの設定
const config = new SetConfig();
const main = new Main(config.getConfigData());

// メイン処理
main.main();
