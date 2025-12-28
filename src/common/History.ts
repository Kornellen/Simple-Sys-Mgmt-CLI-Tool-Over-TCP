export class History {
  private static historyList: string[] = [""];
  private static MAX_HISTORY_BUFFER = 30;

  public static saveToHistory(cmd: string): void {
    if (cmd.length < 2) return;

    if (this.historyList.length < this.MAX_HISTORY_BUFFER)
      this.historyList.push(cmd);

    if (this.historyList.length === this.MAX_HISTORY_BUFFER) {
      this.historyList.shift();
      this.historyList.unshift(cmd);
    }
  }

  public static get getNumberOfStoredCommands(): number {
    return this.historyList.length;
  }

  public static getCommandFromHistory(idx: number): string {
    return this.historyList[idx];
  }

  public static get getCommandsFromHistory(): string[] {
    return this.historyList;
  }
}
