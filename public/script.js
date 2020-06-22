// URLs to request
const crossOriginHttpsUrl = 'https://site-two.glitch.me/ref'
const crossOriginHttpsUrlIframe = 'https://site-two.glitch.me/ifr'
const sameOriginUrl = '/other'
const urls = [crossOriginHttpsUrl, sameOriginUrl]

// policies
const nrwd = 'no-referrer-when-downgrade'
const sowco = 'strict-origin-when-cross-origin'
const other = 'other'
const policyKeyToPolicyValue = {
  '0': null,
  '1': nrwd,
  '2': sowco
}

// DOM elements and mapping
const policyEl = document.getElementById('detected-policy')
const buttonsEls = document.querySelectorAll('button')
const referrerValueElCross = document.getElementById(
  'cross-origin-no-downgrade'
)
const iframeWrapperEl = document.getElementById('iframeWrapper')
const imageWrapperEl = document.getElementById('imageWrapper')
const referrerValueElSame = document.getElementById('same-origin')
const elementsByUrlMap = {
  [crossOriginHttpsUrl]: referrerValueElCross,
  [sameOriginUrl]: referrerValueElSame
}
const head = document.getElementById('head')

main()

function main() {
  // infer the default policy and display it (once only)
  fetch(crossOriginHttpsUrl)
    .then((referrer) => referrer.text())
    .then((referrer) => {
      const policy = inferPolicyXsHttps(referrer)
      displayPolicy(policy)
    })

  getAndDisplayAllFetchReferrers()
  createIframe()
  createImage()
}

// Referrer utils

function inferPolicyXsHttps(referrer) {
  const origin = window.location.origin
  const full = window.location.href
  if (referrer === origin || referrer === `${origin}/`) {
    // OR: origin, origin-when-cross-origin, strict-origin, unsafe-url
    return sowco
  } else if (referrer === full) {
    // OR origin-when-cross-origin
    return nrwd
  }
  return other
}

function switchPolicy(event) {
  const selectedButton = event.currentTarget
  styleButtons(selectedButton)
  displayAsLoading()
  const policyKey = selectedButton.value
  const policy = policyKeyToPolicyValue[policyKey]
  const referrerPolicyMeta = document.getElementById('referrer-policy-meta')
  // remove the tag alltogether
  if (referrerPolicyMeta) {
    referrerPolicyMeta.remove()
  }
  // recreate it on the fly if a policy is selected - otherwise, do nothing (no tag)
  if (policy) {
    const newReferrerPolicyMeta = document.createElement('meta')
    newReferrerPolicyMeta.setAttribute('name', 'referrer')
    newReferrerPolicyMeta.setAttribute('content', policy)
    newReferrerPolicyMeta.setAttribute('id', 'referrer-policy-meta')
    head.appendChild(newReferrerPolicyMeta)
  }
  console.log(
    'referrer-policy meta tag:',
    document.getElementById('referrer-policy-meta')
  )
  getAndDisplayAllFetchReferrers(policy)
  createIframe(policy)
  createImage()
}

function createImage() {
  const image = document.getElementById('img')
  if (image) {
    image.remove()
  }
  const newImage = document.createElement('img')
  newImage.src = `https://i.imgur.com/XArLydn.jpg?dummy=${new Date().getTime()}`
  newImage.id = 'img'
  newImage.width = 60
  imageWrapperEl.appendChild(newImage)
}

async function getAndDisplayAllFetchReferrers(policy) {
  urls.forEach(async (url) => {
    const referrerResponse = await fetch(url)
    const referrer = await referrerResponse.text()
    displayReferrer(url, referrer)
  })
}

function createIframe(policy) {
  const newIframe = document.createElement('iframe')
  newIframe.id = 'iframe'
  newIframe.src = crossOriginHttpsUrlIframe
  newIframe.height = 150
  const oldIframe = document.getElementById('iframe')
  if (oldIframe) {
    iframeWrapperEl.replaceChild(newIframe, oldIframe)
  } else {
    iframeWrapperEl.appendChild(newIframe)
  }
}

// Side effects / DOM display

function displayPolicy(policy) {
  policyEl.innerHTML = policy
}

function styleButtons(buttonToSelect) {
  buttonsEls.forEach((btn) => (btn.className = ''))
  buttonToSelect.className = 'selected'
}

function displayAsLoading() {
  Object.values(elementsByUrlMap).forEach((el) => {
    el.innerHTML = '...'
  })
}

function displayReferrer(url, referrer) {
  const formattedReferrer = referrer.replace(
    /stuff\/detail\?tag=red/g,
    '<span class="nok">stuff/detail?tag=red</span>'
  )
  elementsByUrlMap[url].innerHTML = formattedReferrer
}
