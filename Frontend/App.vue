// App.vue

<template>
  <div>
    <div>LIGHTS: {{lights}}</div>
    <div>________________-</div>
    <div>GROUPS: {{groups}}</div>
  </div>
</template>

<script lang="js">
const axios = require("axios");
import Vue from "vue";

export default Vue.extend({
  mounted: function() {
    this.bundler = "hello";
    const ctx = this;
    axios
      .get("http://localhost:3000/groups")

      .then(function(response) {
        // handle success
        console.log(response);
        ctx.groups = response.data;
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
    axios
      .get("http://localhost:3000/lights")

      .then(function(response) {
        // handle success
        console.log(response);
        ctx.lights = response.data;
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  },

  data() {
    return {
      bundler: "Parcel",
      groups: [],
      lights: []
    };
  }
});
</script>

<style lang="scss" scoped>
.container {
  color: red;
}
</style>