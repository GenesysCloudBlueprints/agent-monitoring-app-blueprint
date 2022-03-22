module.exports = {
  configureWebpack: {
    resolve: {
      mainFields: ['jsnext:main', 'browser', 'module', 'main']
    }
  }
}
