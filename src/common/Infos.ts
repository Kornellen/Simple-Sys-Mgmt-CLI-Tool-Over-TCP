import { Socket } from "net";
import { activeConnections } from "../server.js";

export function displayHelp() {
  console.log(`
select - Allows user to choose one host from all connected to server
state - Allows user to check current console mode (Command Input | Host Selection)
hosts - Shows all hosts connected to server
host - Displays info about selected host
exit - Disconnects selected host
? - Displays help
        `);
}

export function describeHost(host: Socket, idx?: number): void {
  console.log(
    `----------------------------------------
${idx === undefined ? "" : `(${idx}/${activeConnections.size - 1})`}
Remote: ${host.remoteAddress},\xa0
Local: ${host.localAddress},\xa0
Bytes sent: ${host.bytesWritten},\xa0
Bytes recived: ${host.bytesRead}`
  );
}
