/* global chrome, moment */
import { urls } from '/js/urls.js'
import { setPopup, post, getSavedUser, ensureAuth } from '/js/utils.js'

let entryTime
let currentUrl
let savedUser
let userExit = false
let reportingInProgress = false

chrome.storage.onChanged.addListener(changes => {
  changes.user && changes.user.newValue === null ? removeTabListeners() : addTabListeners()
})
chrome.idle.setDetectionInterval(15)

monitor()

async function monitor () {
  let authorized = await ensureAuth()
  if (authorized) {
    savedUser = await getSavedUser()
    addTabListeners()
  } else {
    setPopup('/views/popup.html')
  }
}

async function reportUrl (url) {
  !currentUrl && (currentUrl = url)
  if (url && !reportingInProgress) {
    reportingInProgress = true
    if (entryTime && !userExit) {
      const timeSpent = Date.now() - entryTime
      if (timeSpent > 1000) {
        const raport = new Raport(timeSpent)
        await raport.post()
      }
    }
    userExit && (userExit = false)
    currentUrl = url
    entryTime = Date.now()
    chrome.tabs.onRemoved.addListener(handleTabClosing)
    chrome.idle.onStateChanged.addListener(handleIdleState)
    reportingInProgress = false
  }
}

async function handleTabClosing (tabId, changeInfo) {
  const currentTabId = !changeInfo.isWindowClosing && await getCurrentTabId()
  if (!reportingInProgress && !userExit && (tabId === currentTabId || !currentTabId)) {
    reportingInProgress = true
    const timeSpent = Date.now() - entryTime
    if (timeSpent > 1000) {
      const raport = new Raport(timeSpent)
      await raport.post()
    }
    chrome.tabs.onRemoved.removeListener(handleTabClosing)
    reportingInProgress = false
    userExit = true
  }
}

async function handleIdleState (state) {
  console.log('idle')
  if ((state !== 'active') && !reportingInProgress && !userExit) {
    reportingInProgress = true
    const timeSpent = Date.now() - entryTime
    if (timeSpent > 1000) {
      const raport = new Raport(timeSpent)
      await raport.post()
    }
    chrome.idle.onStateChanged.removeListener(handleIdleState)
    reportingInProgress = false
    userExit = true
  } else if (state === 'active') {
    entryTime = Date.now()
    reportUrl(currentUrl)
  }
}

async function updatedTabListener (tabId, tabInfo) {
  let currentTabId = await getCurrentTabId()
  ;(currentTabId === tabId) && reportUrl(tabInfo.url)
}

async function onActivatedTabListener (activeInfo) {
  let currentTabId = await getCurrentTabId()
  chrome.tabs.get(activeInfo.tabId, tab => {
    (currentTabId === activeInfo.tabId) && reportUrl(tab.url)
  })
}

function addTabListeners () {
  chrome.tabs.onUpdated.addListener(updatedTabListener)
  chrome.tabs.onActivated.addListener(onActivatedTabListener)
}

function removeTabListeners () {
  chrome.tabs.onUpdated.removeListener(updatedTabListener)
  chrome.tabs.onActivated.removeListener(onActivatedTabListener)
}

function getCurrentTabId () {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        var currentTab = tabs[0]
        currentTab && resolve(currentTab.id)
      })
    } catch (error) {
      reject(error)
    }
  })
}

class Raport {
  constructor (timeSpent) {
    this.timeSpent = timeSpent
    this.url = currentUrl.split('/')[2]
    this.time = moment().format('YYYY-MM-DDTHH:mm:ss')
    this.userId = savedUser.user._id
  }

  async post () {
    const response = await post(urls.report, this)
    response.status === 401 && setPopup('/views/popup.html')
    return response
  }
}
