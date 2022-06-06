module.exports = {
  configureWebpack: {
    resolve: {
      mainFields: ['jsnext:main', 'browser', 'module', 'main']
    }
  },
  publicPath: '/agent-monitoring-app-blueprint/'
}
