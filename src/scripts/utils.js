export function getNavigationType(fromPath, toPath) {
  if (fromPath === '/' && toPath.startsWith('/products')) {
    return 'home-to-product'
  }

  if (fromPath.startsWith('/products') && toPath === '/') {
    return 'product-to-home'
  }

  return 'other'
}

export function isBackNavigation(navigateEvent) {
  if (
    navigateEvent.navigationType === 'push' ||
    navigateEvent.navigationType === 'replace'
  ) {
    return false
  }
  if (
    navigateEvent.destination.index !== -1 &&
    navigateEvent.destination.index < navigation.currentEntry.index
  ) {
    return true
  }
  return false
}

export function shouldNotIntercept(navigationEvent) {
  return (
    navigationEvent.canIntercept === false ||
    // If this is just a hashChange,
    // just let the browser handle scrolling to the content.
    navigationEvent.hashChange ||
    // If this is a download,
    // let the browser perform the download.
    navigationEvent.downloadRequest ||
    // If this is a form submission,
    // let that go to the server.
    navigationEvent.formData
  )
}

export function getLink(href) {
  const fullLink = new URL(href, location.href).href

  return [...document.querySelectorAll('a')].find(
    (link) => link.href === fullLink
  )
}

export function getPathId(path) {
  return path.split('/')[2]
}

export function updateTheDOMSomehow(data) {
  document.getElementById('content').innerHTML = data
}
