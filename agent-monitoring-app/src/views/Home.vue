<template>
  <div class="container">
    <div class="instructions">
      Select a queue from the drop-down list and view all of the agents' status in real-time.
    </div>
    <div class="home">
      <QueueSelector @queueSelected="onQueueSelected" />
      <QueueDetails :queue="queue" />
    </div>
  </div>
</template>

<style scoped>
  .instructions {
    font-size: 18px;
    padding: 10px;
  }

  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .home {
    width: 900px;
  }
</style>

<script lang="ts">
import platformClient from 'purecloud-platform-client-v2'
import genesysCloudService from '@/services/genesyscloud-service'
import { defineComponent } from 'vue'
import QueueSelector from '@/components/QueueSelector.vue'
import QueueDetails from '@/components/QueueDetails.vue'

export default defineComponent({
  name: 'Home',
  components: {
    QueueSelector,
    QueueDetails
  },
  data () {
    return {
      queue: {} as platformClient.Models.Queue
    }
  },
  methods: {
    async onQueueSelected (queueId: string): Promise<void> {
      this.queue = await genesysCloudService.getQueue(queueId) ?? {}
    }
  }
})
</script>
