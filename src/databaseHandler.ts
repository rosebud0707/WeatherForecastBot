import mysql from "mysql2/promise";
import * as log4js from "log4js";

export interface ICnt extends mysql.RowDataPacket {
  cnt: number;
}

/**
 * DatabaseHandler
 * DBへの接続、クエリの実行
 */
export class DatabaseHandler {
  private host: string;
  private user: string;
  private databaseName: string;
  private password: string;
  private logger: log4js.Logger;
  private connection: mysql.Connection | null;

  constructor(
    prmHost: string,
    prmUser: string,
    prmDatabaseName: string,
    prmPassword: string,
    prmLogger: log4js.Logger
  ) {
    this.host = prmHost;
    this.user = prmUser;
    this.databaseName = prmDatabaseName;
    this.password = prmPassword;
    this.connection = null;
    this.logger = prmLogger;
  }

  /**
   * dbConnect
   * DBへの接続を行う
   */
  public async dbConnect(): Promise<void> {
    try {
      this.logger.info("DB接続情報設定");
      this.connection = await mysql.createConnection({
        host: this.host,
        user: this.user,
        password: this.password,
        database: this.databaseName,
      });
      this.logger.info("DB接続");
      await this.connection.connect();
    } catch (error) {
      this.logger.error("DB接続エラー");
      throw error;
    }
  }

  /**
   * selectData
   * データ抽出を行う。
   */
  public async selectData(query: string): Promise<ICnt[]> {
    try {
      this.logger.info("データ抽出処理");
      if (this.connection != null) {
        const [rows, fields] = await this.connection.execute(query);
        return rows as ICnt[];
      } else {
        this.logger.error("DB接続未確立エラー");
        throw new Error("DBConnection is not Established");
      }
    } catch (error) {
      this.logger.error("データ抽出エラー");
      throw error;
    }
  }

  /**
   * insUpdateData
   * データ登録、更新を行う。
   */
  public async insUpdateData(query: string): Promise<void> {
    try {
      this.logger.info("データ登録、更新処理");
      if (this.connection != null) {
        await this.connection.query(query);
      } else {
        this.logger.error("DB接続未確立エラー");
        throw new Error("DBConnection is not Established");
      }
    } catch (error) {
      this.logger.error("データ登録、更新エラー");
      throw error;
    }
  }

  /**
   * closeDbConnect
   * DB切断を行う。
   */
  public async closeDbConnect(): Promise<void> {
    try {
      this.logger.info("DB切断");
      if (this.connection != null) {
        await this.connection.end;
      } else {
        this.logger.error("DB接続未確立エラー");
        throw new Error("DBConnection is not Established");
      }
    } catch (error) {
      this.logger.error("DB切断エラー");
      throw error;
    }
  }
}
