import { activeConnections } from "../server.js";
import { History } from "./History.js";
import { Socket } from "net";
import { CommandHandler, KeyboardState } from "./Keyboard.types.js";

export class KeyboardHandler {
  private static currentLine: string = "";
  private static commandIdx = -1;
  private static callback?: CommandHandler;
  public static state: KeyboardState = KeyboardState.INPUT_COMMAND;
  private static selectedHost: Socket;
  private static isInit: boolean = false;
  public static init(callback: CommandHandler) {
    if (!this.isInit) {
      this.callback = callback;
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", this.onKey.bind(this));
      this.isInit = true;
    }

    this.redrawLine();
  }

  public static setState(state: KeyboardState) {
    this.state = state;
    this.currentLine = "";
    this.redrawLine();
  }

  public static onKey(key: string): void | Socket {
    if (key === "\u0003") process.exit();

    if (key === "\r") {
      const value = this.currentLine.trim();
      switch (this.state) {
        case KeyboardState.INPUT_COMMAND:
          this.onCommandInput(value);
          break;

        case KeyboardState.SELECT_HOST:
          this.onHostSelect(value);
          break;
      }

      return;
    }

    this.handleKey(key, "\u001b[A", () => {
      if (this.commandIdx > 0) {
        this.commandIdx--;
        this.currentLine = History.getCommandFromHistory(this.commandIdx);
      }
      this.redrawLine();
      return;
    });

    this.handleKey(key, "\u001b[B", () => {
      if (this.commandIdx < History.getNumberOfStoredCommands - 1) {
        this.commandIdx++;
        this.currentLine = History.getCommandFromHistory(this.commandIdx) ?? "";
      }
      this.redrawLine();
      return;
    });

    this.handleKey(key, "\u001b[C", () => {
      process.stdout.write("\n--------------History----------------------\n");
      History.getCommandsFromHistory.forEach((history) =>
        process.stdout.write("\x1b[K" + history + "\n")
      );
    });

    if (key === "\u007f") {
      this.currentLine = this.currentLine.slice(0, -1);
      this.redrawLine();
      return;
    }

    this.currentLine += key;
    process.stdout.write(key);
  }

  private static redrawLine() {
    process.stdout.write("\r\x1b[K>" + this.currentLine);
  }

  private static onHostSelect(value: string) {
    if (value.length === 0) return;

    const idx = Number(value);

    if (Number.isNaN(idx)) {
      console.log("invalid index");
      return;
    }

    this.selectedHost = Array.from(activeConnections.values())[idx];
    if (!this.selectedHost) {
      console.log("Invalid host");
      this.redrawLine();
      return;
    }

    console.log(`\nSelected host with ID: ${idx}`);
    this.redrawLine();
    this.setState(KeyboardState.INPUT_COMMAND);
  }
  private static handleKey(handledKey: string, key: string, clb: () => void) {
    if (handledKey === key) clb();
  }
  private static onCommandInput(value: string) {
    console.log();
    History.saveToHistory(value);
    this.commandIdx = History.getNumberOfStoredCommands;
    this.currentLine = "";

    if (value && this.callback) this.callback(value, this.selectedHost);

    this.redrawLine();
  }
}
