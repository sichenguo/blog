// 组件父级

<template>
    <div>
        <ul v-for="(topLevelItem,i) in fomattedItems" :key="i">
            <img :src="topLevelItem.imagePath">
        </ul>
        <nested-list :items="topLevelItem.nestedItems" />
    </div>
</template>

<script>
import { mapState } from 'vuex'
import NestedList from '~/components/NestedList '
import data from '~/data/items.json'
import removeFalsyItems from '~/scripts/removeFalsyItems'
export default {
    data() {
        return {}
    },
    components: {
        NestedList
    },
    computed: {
        fomattedItems() {
            return removeFalsyItems(data)
        }
    }
}
</script>




