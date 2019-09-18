// App.vue

<template lang="pug">
  .container Hello {{bundler}}
</template>

<script lang="ts">
const axios = require("axios");
import Vue from "vue";

export default Vue.extend({
  created: function() {
    axios
      .get("http://localhost:3000/")

      .then(function(response) {
        // handle success
        console.log(response);
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  },
  data() {
    return {
      bundler: "Parcel"
    };
  }
});
</script>

<style lang="scss" scoped>
.container {
  color: red;
}
</style>