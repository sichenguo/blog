// nestedList 组件
<template>
  <div>
    <ul>
      <li v-for="(secondLevelItem, i) in items" :key="i" @click="onNestedItemClick(secondLevelItem.text)">{{secondLevelItem.text}}</li>
    </ul>
  </div>
</template>

<script >
import axios from 'axios'

export default {
  props: {
    items: {
      type: Array,
      defafult: null
    },
    onNestedItemClick: {
      type: Function,
      defafult: null
    }
  }
}
</script>