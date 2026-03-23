<template>
  <AppHeader/>
  <div v-if="authError" class="auth-error">{{ authError }}</div>
  <router-view v-else-if="authenticated"/>
  <div v-else class="auth-loading">Authenticating...</div>
</template>

<style>
body {
  height: 100%;
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

select {
  color: #2c3e50;
}
</style>

<script lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import genesysCloud from '@/services/genesyscloud-service'

export default {
  name: 'Agent Monitoring App',
  components: {
    AppHeader
  },
  data () {
    return {
      authenticated: false,
      authError: null as string | null,
    }
  },
  async created (): Promise<void> {
    try {
      await genesysCloud.loginWithPKCE()
      this.authenticated = true
    } catch (error) {
      console.error('Authentication failed', error)
      this.authError = 'Failed to authenticate. Please try again.'
    }
  }
}
</script>
