/**
 * configファイル データ型定義
 */
export type WeatherForecastSettings = {
  misskey_account_setting: MisskeyAccountSetting;
  request_urls: RequestUrls;
  log_setting: LogSetting;
  db_setting: DBSetting;
  request_limit: number;
  pref_list: PrefList;
};

/**
 * configファイル データ型定義
 * Misskey各種設定
 */
export type MisskeyAccountSetting = {
  domain_name: string;
  host_name: string;
  api_key: string;
  connect_channel: string;
  account_id: string;
  websocket_url: string;
  connect_retry_cnt: number;
};

/**
 * configファイル データ型定義
 * APIリクエスト先URL
 */
export type RequestUrls = {
  overview_base_3days_url: string;
  forecast_base_3days_url: string;
  forecast_base_1week_url: string;
};

/**
 * configファイル データ型定義
 * ログファイル設定
 */
export type LogSetting = {
  log_level: string;
  file_name: string;
  folder_path: string;
};

/**
 * configファイル データ型定義
 * DB設定
 */
export type DBSetting = {
  host: string;
  user: string;
  database_name: string;
  password: string;
};

/**
 * configファイル データ型定義
 * 都道府県リスト
 */
export type PrefList = {
  [code: string]: string;
};
