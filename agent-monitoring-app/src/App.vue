<template>
  <AppHeader/>
  <router-view/>
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
import genesysCloud from '@/services/genesyscloud-service'
import AppHeader from '@/components/AppHeader.vue'
import config from '@/config/config'

export default {
  name: 'Agent Monitoring App',
  components: {
    AppHeader
  },
  async created (): Promise<void> {
    await genesysCloud.loginImplicitGrant()
    history.pushState({}, '', config.redirectUri)
  }
}
</script>
