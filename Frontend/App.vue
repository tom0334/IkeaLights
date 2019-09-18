// App.vue

<template lang="pug">
  .container Hello {{groups}}
</template>

<script lang="ts">
const axios = require("axios");
import Vue from "vue";

export default Vue.extend({
  mounted: function() {
    this.bundler = "hello";
    const ctx = this;
    axios
      .get("http://localhost:3000/lights")

      .then(function(response) {
        // handle success
        console.log(response);
        ctx.groups = response.data;
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  },
  data() {
    return {
      bundler: "Parcel",
      groups: []
    };
  }
});
</script>

<style lang="scss" scoped>
.container {
  color: red;
}
</style>