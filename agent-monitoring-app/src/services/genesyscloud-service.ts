import platformClient from 'purecloud-platform-client-v2'

const client = platformClient.ApiClient.instance
const routingApi = new platformClient.RoutingApi()
const notificationsApi = new platformClient.NotificationsApi()

let userStatusWebsocket: WebSocket

export default {
  async loginWithPKCE (): Promise<platformClient.AuthData> {
    const environment = new URLSearchParams(window.location.search).get('environment')
      || import.meta.env.VITE_GENESYSCLOUD_ENVIRONMENT
      || 'mypurecloud.com'

    client.setPersistSettings(true, 'agent-monitoring-app')
    client.setEnvironment(environment)

    return await client.loginPKCEGrant(
      import.meta.env.VITE_GENESYSCLOUD_CLIENT_ID,
      import.meta.env.VITE_GENESYSCLOUD_REDIRECT_URI
    )
  },

  // Get the organization's queues.
  // NOTE: For this sample only get the first 100.
  async getQueues (): Promise<undefined | platformClient.Models.Queue[]> {
    const data = await routingApi.getRoutingQueues({ pageSize: 100 })
    return data.entities
  },

  async getQueue (queueId: string): Promise<platformClient.Models.Queue> {
    const data = await routingApi.getRoutingQueue(queueId)
    return data
  },

  // Get the queue's members
  // NOTE: For this sample only get the first 100.
  async getMembersOfQueue (queueId: string): Promise<undefined | platformClient.Models.QueueMember[]> {
    const data = await routingApi.getRoutingQueueMembers(queueId, { pageSize: 100, expand: ['presence', 'routingStatus'] })
    return data.entities
  },

  async subscribeToUsersStatus (userIds: string[], callbacks: ((message: MessageEvent) => void)[]): Promise<void> {
    const channel = await notificationsApi.postNotificationsChannels()
    if (!channel.connectUri || !channel.id) throw new Error('Channel not created')

    // Assign callbacks to websocket
    if (userStatusWebsocket) userStatusWebsocket.close()
    userStatusWebsocket = new WebSocket(channel.connectUri)
    userStatusWebsocket.onmessage = (message) => {
      for (const cb of callbacks) {
        cb(message)
      }
    }

    const topics: platformClient.Models.ChannelTopic[] = userIds.map(userId => ({
      id: `v2.users.${userId}?presence&routingStatus`
    }))

    await notificationsApi.postNotificationsChannelSubscriptions(channel.id, topics)
  }
}
