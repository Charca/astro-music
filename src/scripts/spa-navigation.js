import {
  getLink,
  getNavigationType,
  getPathId,
  isBackNavigation,
  shouldNotIntercept,
  updateTheDOMSomehow,
} from './utils'

navigation.addEventListener('navigate', (navigateEvent) => {
  if (shouldNotIntercept(navigateEvent)) return

  const toUrl = new URL(navigateEvent.destination.url)
  const toPath = toUrl.pathname
  const fromPath = location.pathname
  const navigationType = getNavigationType(fromPath, toPath)

  if (location.origin !== toUrl.origin) return

  switch (navigationType) {
    case 'home-to-product':
      handleHomeToProductTransition(navigateEvent, toPath)
      break
    case 'product-to-home':
      handleProductToHomeTransition(navigateEvent, toPath, fromPath)
      break
    default:
      return
  }
})

function handleHomeToProductTransition(navigateEvent, toPath) {
  const handler = async () => {
    const response = await fetch(`/fragments${toPath}`)
    const data = await response.text()

    if (!document.createDocumentTransition) {
      updateTheDOMSomehow(data)
      return
    }

    const transition = document.createDocumentTransition()
    const link = getLink(toPath)
    const image = link.querySelector('.product__img')
    const background = link.querySelector('.product__bg')

    if (image && background) {
      image.classList.add('product-image')
      background.classList.add('product-bg')
    }

    transition.start(() => {
      if (image && background) {
        image.classList.remove('product-image')
        background.classList.remove('product-bg')
      }
      // document.getElementById('container').scrollTop = 0
      updateTheDOMSomehow(data)
    })
  }

  navigateEvent.transitionWhile(handler())
}

function handleProductToHomeTransition(navigateEvent, toPath, fromPath) {
  const handler = async () => {
    const response = await fetch(`/fragments${toPath}`)
    const data = await response.text()

    if (!document.createDocumentTransition) {
      updateTheDOMSomehow(data)
      return
    }

    const transition = document.createDocumentTransition()
    let image
    let background

    transition
      .start(() => {
        updateTheDOMSomehow(data)

        const link = getLink(fromPath)
        image = link.querySelector('.product__img')
        background = link.querySelector('.product__bg')

        if (image && background) {
          image.classList.add('product-image')
          background.classList.add('product-bg')
          image.scrollIntoViewIfNeeded()
        }
      })
      .then(() => {
        if (image && background) {
          image.classList.remove('product-image')
          background.classList.remove('product-bg')
        }
      })
  }

  navigateEvent.transitionWhile(handler())
}
