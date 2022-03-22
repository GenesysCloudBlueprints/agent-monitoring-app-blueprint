import platformClient from 'purecloud-platform-client-v2'
import config from '@/config/config'

const routingApi = new platformClient.RoutingApi()
const notificationsApi = new platformClient.NotificationsApi()

let userStatusWebsocket : WebSocket

export default {
  // Login to Genesys Cloud
  async loginImplicitGrant (): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search)
    const environment = urlParams.get('environment') || localStorage.getItem('gc-environment') || 'mypurecloud.com'
    const client = platformClient.ApiClient.instance

    client.setPersistSettings(true, 'agent-monitoring-app')
    client.setEnvironment(environment)
    localStorage.setItem('gc-environment', environment)

    await client.loginImplicitGrant(config.clientId, config.redirectUri)

    console.log('Authenticated')
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
    console.log(data)
    return data.entities
  },

  async subscribeToUsersStatus (userIds: string[], callbacks: ((message: MessageEvent) => void)[]): Promise<void> {
    let channelId = ''

    const channel = await notificationsApi.postNotificationsChannels()

    if (!channel.connectUri || !channel.id) throw new Error('Channel not created')
    console.log('Channel created')
    channelId = channel.id

    // Assign callbacks to websocket
    if (userStatusWebsocket) userStatusWebsocket.close()
    userStatusWebsocket = new WebSocket(channel.connectUri)
    userStatusWebsocket.onmessage = (message) => {
      for (const cb of callbacks) {
        cb(message)
      }
    }

    // Subscribe to topics
    const topics:platformClient.Models.ChannelTopic[] = []
    userIds.forEach(userId => {
      topics.push({
        id: `v2.users.${userId}?presence&routingStatus`
      })
    })

    await notificationsApi.postNotificationsChannelSubscriptions(channelId, topics)
    console.log('Subscribed to topics')
  }
}
