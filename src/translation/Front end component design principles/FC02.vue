// 组件父级
<template>
  <div>
    <ul v-for="(topLevelItem,i) in fomattedItems" :key="i">
      <img :src="topLevelItem.imagePath">
    </ul>
    <nested-list :items="topLevelItem.nestedItems" v-bind="{onNestedItemClick}" />
  </div>
</template>

<script>
import NestedList from '~/components/NestedList '
export default {
  components: {
    NestedList
  },
  props: {
      items:{
          type: Array,
          default: null
      },
      onNestedItemClick:{
          type: Function,
          default: null
      }
  }
}
</script>




