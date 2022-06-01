<template>
  <select @change='onChange' name="queue-selector" id="queue-selector">
    <option selected disabled hiddem>Select Queue</option>
    <option v-for="queue in queues" :key="queue.id" :value="queue.id">
      {{ queue.name }}
    </option>
  </select>
</template>

<style scoped>
  select {
    margin-top: 20px;
    width: 100%;
    height: 50px;
    font-size: 1.5em;
    padding-left: 10px;
    border: 1px solid #ccc;
    background-color: #fff;
  }
</style>

<script lang="ts">
import platformClient from 'purecloud-platform-client-v2'
import genesysCloudService from '@/services/genesyscloud-service'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'QueueList',
  data () {
    return {
      queues: [] as platformClient.Models.Queue[],
      selectedOption: ''
    }
  },
  methods: {
    onChange (event: Event) {
      if (event.target) {
        const queueId = (event.target as HTMLInputElement).value
        this.$emit('queueSelected', queueId)
      }
    }
  },
  emits: ['queueSelected'],
  created () {
    genesysCloudService.getQueues()
      .then(queues => {
        if (queues) this.queues = queues
      })
      .catch(err => console.error(err))
  }
})
</script>
