import fetch from "node-fetch";

export class MisskeyAPIRapper {
  private domain: string;
  private apiKey: string;

  constructor(dm: string, ky: string) {
    this.domain = dm;
    this.apiKey = ky;
  }

  public async noteCreation(visibility: string, note: string, cwNote?: string) {
    {
      // CWに設定する文字の有無でPOSTのBODY部を切り替える
      let postJson: object;
      if (cwNote !== undefined) {
        postJson = {
          visibility: visibility,
          cw: cwNote,
          text: note,
        };
      } else {
        postJson = { visibility: visibility, text: note };
      }

      try {
        // POST処理
        await fetch(this.domain + "api/notes/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.apiKey,
          },
          body: JSON.stringify(postJson),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  }
}
