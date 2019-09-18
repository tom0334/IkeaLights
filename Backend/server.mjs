import Tradfri from "node-tradfri-client"
const {
  TradfriClient
} = Tradfri

const {
  discoverGateway,
  AccessoryTypes
} = Tradfri

import constants from "./PrivateConstants.mjs"

Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)]
}



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
const lightbulbs = {}

let blinking = false

function tradfri_groupUpdated(group) {
  groups[group.instanceId] = group;
  if (group.name === constants.GROUP_NAME && blinking === false) {
    blink(group)
  }
  const statusStr = "...Current status:" + (group.onOff ? "On" : "off")
  // console.log("Group updated:", group.name, statusStr)
}

function tradfri_deviceUpdated(device) {
  if (device.type === AccessoryTypes.lightbulb) {
    lightbulbs[device.instanceId] = device;
  }
  // console.log("Light updated!", device)
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

  tradfri
    .on("device updated", tradfri_deviceUpdated)
    .observeDevices();
}




function blink(group) {
  blinking = true
  // console.log("Blinking group with name:", group.name)

  function timeout() {
    setTimeout(function () {
      const light = getLightsInGroup(group).randomElement()
      try {
        const state = light.onOff
        console.log("Attemtping to toggle light:", light._accessory.instanceId, state)
        light.toggle(!state)
      } catch (e) {
        console.log("Could not find", light, e)
      }

      timeout();
    }, 1000);
  }
  timeout()

}

/**
 * The deviceIDs also contains non light devices, this function filters that out.
 * @param group The group to find a list of lights in.
 */
function getLightsInGroup(group) {
  const lightIds = group.deviceIDs.filter(id => lightbulbs.hasOwnProperty(id))
  return lightIds.map(id => lightbulbs[id].lightList[0])
}


main()