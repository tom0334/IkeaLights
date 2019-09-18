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

/**
 * The deviceIDs also contains non light devices, this function filters that out.
 * @param group The group to find a list of lights in.
 */
function getLightsInGroup(group, lightbulbs) {
  const lightIds = group.deviceIDs.filter(id => lightbulbs.hasOwnProperty(id))
  return lightIds.map(id => lightbulbs[id].lightList[0])
}


export default class Communicator {

  constructor() {
    this.groups = {}
    this.lightbulbs = {}
    this.blinking = false
    this.tradfri_deviceUpdated = this.tradfri_deviceUpdated.bind(this)
    this.tradfri_groupUpdated = this.tradfri_groupUpdated.bind(this)
  }

  async authenticate(tradfri) {
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

  getGroups() {
    const createGroupObject = (id) => {
      const complexGroup = this.groups[id]
      const simpleGroup = {
        "name": complexGroup.name,
        "id": id
      }
      return simpleGroup
    }

    const ids = Object.keys(this.groups)
    const simpleGroups = ids.map(groupId => createGroupObject(groupId))
    return simpleGroups
  }

  getLights() {
    const createLightObject = (id) => {
      const complexLight = this.lightbulbs[id].lightList[0]
      const simpleLight = {
        "id": id,
        "on": complexLight.onOff
      }
      console.log("LIGHT", complexLight)
      return simpleLight
    }

    const ids = Object.keys(this.lightbulbs)
    const simpleLights = ids.map(lightId => createLightObject(lightId))
    return simpleLights
  }

  tradfri_groupUpdated(group) {
    this.groups[group.instanceId] = group;
    if (group.name === constants.GROUP_NAME && this.blinking === false) {
      this.blink(group)
    }
    const statusStr = "...Current status:" + (group.onOff ? "On" : "off")
    // console.log("Group updated:", group.name, statusStr)
  }

  tradfri_deviceUpdated(device) {
    if (device.type === AccessoryTypes.lightbulb) {
      this.lightbulbs[device.instanceId] = device;
    }
    // console.log("Light updated!", device)
  }

  async initInBackground() {
    const tradfri = new TradfriClient(constants.GATEWAY);

    const authResult = await this.authenticate(tradfri)
    try {
      await tradfri.connect(authResult.identity, authResult.psk);
    } catch (e) {
      console.log("Failed to connect:", e)
      return false
    }
    // observe devices
    tradfri
      .on("group updated", this.tradfri_groupUpdated)
      .observeGroupsAndScenes();

    tradfri
      .on("device updated", this.tradfri_deviceUpdated)
      .observeDevices();
    return true
  }

  blink(group) {
    this.blinking = true
    // console.log("Blinking group with name:", group.name)
    const connector = this

    function timeout() {
      setTimeout(function () {
        const light = getLightsInGroup(group, connector.lightbulbs).randomElement()
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
}