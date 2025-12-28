import { Socket } from "net";

export type CommandHandler = (cmd: string, host: Socket) => void;

export enum KeyboardState {
  SELECT_HOST = "host_select",
  INPUT_COMMAND = "command_input",
}
