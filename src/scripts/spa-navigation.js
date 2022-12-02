import {
  getLink,
  getNavigationType,
  getPathId,
  isBackNavigation,
  shouldNotIntercept,
  updateTheDOMSomehow,
  wait,
} from './utils'

async function getFragment(toPath) {
  const response = await fetch(`/fragments${toPath}`)
  const data = await response.text()

  return data
}

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
    if (!document.startViewTransition) {
      const data = await getFragment(toPath)
      updateTheDOMSomehow(data)
      return
    }

    return new Promise(async (resolve) => {
      const link = getLink(toPath)
      const image = link.querySelector('.product__img')
      const background = link.querySelector('.product__bg')
      let hasShownTemplate = false
      let htmlFragment = null

      if (image && background) {
        image.classList.add('product-image')
        background.classList.add('product-bg')
      }

      getFragment(toPath).then((data) => {
        // If we've shown a template and we are still on the same path,
        // update the dom with the real data.
        if (hasShownTemplate && location.pathname === toPath) {
          updateTheDOMSomehow(data)
          resolve()
        } else {
          htmlFragment = data
        }
      })

      // Grace period to make an instant transition
      await wait(200)

      const transition = document.startViewTransition(() => {
        if (image && background) {
          image.classList.remove('product-image')
          background.classList.remove('product-bg')
        }

        const template = document.getElementById(
          'product-template-' + getPathId(toPath)
        )

        if (htmlFragment !== null) {
          // If the data has loaded by now, show it right away
          updateTheDOMSomehow(htmlFragment)
          resolve()
        } else if (template) {
          // Otherwhise, show a template that will be replaced by the real data once it arrives
          updateTheDOMSomehow(template.innerHTML)
          hasShownTemplate = true
        }
      })

      return transition.finished;
    })
  }

  navigateEvent.intercept({ handler })
}

function handleProductToHomeTransition(navigateEvent, toPath, fromPath) {
  const handler = async () => {
    const data = await getFragment(toPath)

    if (!document.startViewTransition) {
      updateTheDOMSomehow(data)
      return
    }
    let image
    let background

    document.startViewTransition(() => {
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
      finished.then(() => {
        if (image && background) {
          image.classList.remove('product-image')
          background.classList.remove('product-bg')
        }
      })
  }

  navigateEvent.intercept({ handler })
}
