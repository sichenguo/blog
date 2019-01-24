// nestedList 组件
<template>
  <div>
    <ul>
      <li v-for="(secondLevelItem, i) in items" :key="i" @click="updateText(secondLevelItem.text)">{{secondLevelItem.text}}</li>
    </ul>
  </div>
</template>

<script >
import axios from 'axios'

export default {
  props: {
    items: {
      type: Array,
      defafult: () => []
    }
  },
  methods: {
    updataText(text) {
      this.$store.commit('updateText', text)
      axios.post('/endpoint', { text }).then(res => {
        console.log(res)
      })
    }
  }
}
</script>