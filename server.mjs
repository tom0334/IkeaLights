import Tradfri from "node-tradfri-client"
const {
  TradfriClient
} = Tradfri

const {
  discoverGateway
} = Tradfri

import constants from "./PrivateConstants.mjs"




const authenticate = async function (tradfri) {
  try {
    const {
      identity,
      psk
    } = await tradfri.authenticate(constants.SECURITY_CODE);
    console.log("AUTHRESULT:", identity, psk)
    return {
      "identity": identity,
      "psk": psk
    }
  } catch (e) {
    console.log("Authenticate failed:", e)
  }
  return null


}

const groups = {}
let blinking = false

function tradfri_groupUpdated(group) {
  groups[group.instanceId] = group;
  if (group.name === constants.GROUP_NAME && blinking === false) {
    blink(group)
  }
  const statusStr = "...Current status:" + (group.onOff ? "On" : "off")
  console.log("Group updated:", group.name, statusStr)
}

const main = async function () {
  const tradfri = new TradfriClient(constants.GATEWAY);

  const authResult = await authenticate(tradfri)
  try {
    await tradfri.connect(authResult.identity, authResult.psk);
  } catch (e) {
    console.log("Failed to connect:", e)
  }

  // observe devices
  tradfri
    .on("group updated", tradfri_groupUpdated)
    .observeGroupsAndScenes();
}


function blink(group) {
  console.log(group)
  blinking = true
  console.log("Blinking group with name:", group.name)
  let state = false

  function timeout() {
    setTimeout(function () {
      state = !state
      group.toggle(state)

      timeout();
    }, 3000);
  }
  timeout()

}


main()