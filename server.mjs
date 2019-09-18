import Tradfri from "node-tradfri-client"
const {
  TradfriClient
} = Tradfri

const {
  discoverGateway
} = Tradfri

const main = async function () {

  const result = await discoverGateway();
  console.log(result)


  // connect
  const tradfri = new TradfriClient("gw-abcdef012345");
  try {
    await tradfri.connect(identity, psk);
  } catch (e) {
    console.log("error occured:", e)
    // handle error - see below for details
  }
}

main()