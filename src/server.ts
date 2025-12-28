import { Socket, createServer } from "net";
import { KeyboardHandler } from "./common/KeyboardHandler.js";
import { describeHost, displayHelp } from "./common/Infos.js";
import { KeyboardState } from "./common/Keyboard.types.js";

export const activeConnections: Set<Socket> = new Set();

console.log("Check help under ?");

const server = createServer(async (socket) => {
  console.log(`Host (${socket.localAddress}) connected!\n`);

  activeConnections.add(socket);

  socket.write("SERVER HELLO\n");

  socket.on("data", (data) => {
    console.log(`\nRECIVED: ${data.toString()}`);

    if (data.toString().includes("ACK")) return;

    socket.write("ACK\n");
  });

  socket.on("end", () =>
    console.log(`Host (${socket.localAddress}) disconnected\n`)
  );

  socket.on("error", (err) =>
    console.error(`An error occuired ${err.message}\n`)
  );
});

KeyboardHandler.init((command, host) => {
  if (command === "") return;

  switch (command) {
    case "exit":
      console.log("Host disconnected!");
      activeConnections.delete(host);
      host.destroy();
      break;
    case "hosts":
      activeConnections
        .values()
        .forEach((conn, idx) => describeHost(conn, idx));
      break;

    case "state":
      console.log("Current console mode: " + KeyboardHandler.state);
      break;

    case "select":
      console.log(`Input host index 0-${activeConnections.size - 1} >`);
      KeyboardHandler.setState(KeyboardState.SELECT_HOST);
      break;

    case "host":
      describeHost(host);
      break;
    case "?":
      displayHelp();
      break;
    case "kill":
      process.exit("User killed server...");
    default:
      if (!host) {
        console.log("Invalid host");
        break;
      }
      host.write(command);
      break;
  }
});

server.listen(9000, () => console.log("TCP listen on 9000\n"));
