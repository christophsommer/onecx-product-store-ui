const bypassFn = function (req, res, proxyOptions) {
  // console.log(`bypassing ${req.method} ${req.url} `)
  if (req.method.toUpperCase() === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, HEAD, PUT, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', '*')
    res.setHeader('Access-Control-Allow-Headers', '*')
    //return 'index.html'
    return res.send('')
  }
  if (req.method.toUpperCase() === 'POST') {
    //res.setHeader('Access-Control-Expose-Headers', 'Location')
    return null
  } else {
    return null
  }
}

const PROXY_CONFIG = {
  '/portal-api': {
    target: 'http://product-store-bff',
    secure: false,
    pathRewrite: {
      '^.*/portal-api': '',
    },
    changeOrigin: true,
    logLevel: 'debug',
    bypass: bypassFn,
  },
  '/ahm-api': {
    target: 'http://ahm',
    secure: false,
    pathRewrite: {
      '^.*/ahm-api': '',
    },
    changeOrigin: true,
    logLevel: 'debug',
  },
}

module.exports = PROXY_CONFIG
