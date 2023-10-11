const net = require("net");
const path = require("path");

let listeningChanels = {};
const socketPath = path.resolve(__dirname, "my_first_ipc");
const server = net.createServer().listen(socketPath, () => {
  console.log("Pub sub server initilized");
});

function subscriber(channel, socket) {
  if (!listeningChanels[channel]) {
    listeningChanels[channel] = [];
  }
  console.log(`Subscribing to chanel ${channel}`);
  listeningChanels[channel].push(socket);
}
function publish(channel, msg) {
  if (!listeningChanels[channel]) {
    return;
  }
  for (const socket of listeningChanels[channel]) {
    console.log(`publishing ${msg} to channel ${channel}`);
    socket.write(msg);
  }
}

const regex = {
  sub: /^sub_(.*)$/,
  pub: /^pub_(.*)_(.*)$/,
};
server.on("connection", (socket) => {
  console.log("A new server were conected");
  socket.on("data", (data) => {
    const msg = data.toString();
    const matchSub = msg.match(regex.sub);
    const matchPub = msg.match(regex.pub);
    //inscreve no canal
    if (matchSub && matchSub[1]) {
      const channel = matchSub[1];
      subscriber(channel, socket);
      return;
    }

    //publica no channel a msg
    if (matchPub && matchPub[1]) {
      console.log("matchpub", matchPub);
      const channel = matchPub[1];
      const msg = matchPub[2];
      publish(channel, msg);
      return;
    }
    console.error(new Error(`Unknown command ${msg}`));
  });
});
//cria um server passando path

function testStart(listeningChanels) {
  const clientA = net.connect(
    "/Users/talita/my_message_broker_lab/my_first_ipc"
  );
  console.log("clientA Conected", clientA);
  const clientB = net.connect(
    "/Users/talita/my_message_broker_lab/my_first_ipc"
  );
  console.log("clientb Conected", clientB);
  clientA.write("sub_Talita");
  clientB.write("pub_Talita_Takeshi");
}

testStart(listeningChanels);
