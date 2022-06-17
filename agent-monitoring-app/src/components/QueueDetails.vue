<template>
  <div class="container">
    <div class="loading" v-show="isLoading">
      Loading Members...
    </div>
    <div class="table" v-show="!isLoading">
      <div
        v-for="queueMember of queueMembers"
        :key="queueMember.id"
      >
        <QueueMemberDetails :queueMember="queueMember" />
      </div>
    </div>
    <div class="no-users" v-show="showNoUsers">
      No users assigned in this queue. 😞
    </div>
  </div>
</template>

<style scoped>
.container {
  /* border: 1px solid #ccc; */
  display: flex;
  flex-direction: column;
  margin-top: 10px;
}

.table {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.loading {
  margin: 30px;
  font-size: 1.5em;
}

.no-users {
  margin: 30px;
  font-size: 1.5em;
}
</style>

<script lang="ts">
import genesyscloudService from '@/services/genesyscloud-service'
import platformClient from 'purecloud-platform-client-v2'
import { defineComponent } from 'vue'
import QueueMemberDetails from './QueueMemberDetails.vue'

export default defineComponent({
  name: 'QueueDetails',
  components: {
    QueueMemberDetails
  },
  props: {
    queue: {
      type: Object as () => platformClient.Models.Queue
    }
  },
  data () {
    return {
      queueMembers: [] as platformClient.Models.QueueMember[],
      isLoading: false,
      showNoUsers: false
    }
  },
  watch: {
    queue: async function (): Promise<void> {
      this.isLoading = true
      this.showNoUsers = false

      if (!this.queue?.id) {
        console.error('Queue not found')
        return
      }

      // When a queue is selected, display the queue members (max of 100)
      this.queueMembers = await genesyscloudService.getMembersOfQueue(this.queue.id) ?? []
      const userIds = this.queueMembers.map(member => member.id ?? '')
      if (userIds.length <= 0) {
        console.log('No users in queue')
        this.showNoUsers = true
      } else {
        // Listen to user presence and routing status changes
        await genesyscloudService.subscribeToUsersStatus(userIds, [this.onUserEvent])
      }

      this.isLoading = false
    }
  },
  methods: {
    // Callback function when Genesys Cloud fires notifications based on the queue members
    onUserEvent (message: MessageEvent): void {
      const data = JSON.parse(message.data)
      const topicName = data.topicName
      const eventBody = data.eventBody

      // Update agent view
      const topicRegex = /(v2\.users\.)(.*)\.(.*)/g
      const match = topicRegex.exec(topicName)
      if (!match) return

      const userId = match[2]
      const updatedProperty = match[3]
      console.log(userId)

      const queueMember = this.queueMembers.find(member => member.id === userId)
      if (!queueMember?.user?.presence) {
        console.error('User not find in queue')
        return
      }

      switch (updatedProperty) {
        case 'presence':
          queueMember.user.presence.presenceDefinition = eventBody.presenceDefinition
          break
        case 'routingStatus':
          queueMember.user.routingStatus = eventBody.routingStatus
          if (eventBody.routingStatus.status === 'NOT_RESPONDING') {
            this.showNotRespondingAlert(queueMember.user)
          }

          break
      }
    },
    showNotRespondingAlert (user: platformClient.Models.User): void {
      alert(`${user.name} is not responding.`)
    }
  }
})
</script>
