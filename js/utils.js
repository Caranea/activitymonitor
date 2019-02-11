/* global fetch, chrome */
import { urls } from '/js/urls.js'

async function post (url, data) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Origin': '*'
  }
  const response = await fetch(url, {
    headers: headers,
    method: 'POST',
    body: JSON.stringify(data)
  })
  return response
}

function setPopup (url) {
  chrome.browserAction.setPopup({ popup: url }, () => {})
}

function redirect (url) {
  window.location.href = url
}

async function ensureAuth () {
  const savedUser = await getSavedUser()
  const userData = await getUserData()
  return (!!savedUser.user && !!userData.user && savedUser.user._id === userData.user._id)
}

async function getUserData () {
  let response = await fetch(urls.dashboard)
  response = await response.json()
  return response
}

function getSavedUser () {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('user', function (result) {
      resolve(result)
    })
  })
}

function removeUser () {
  setPopup('/views/popup.html')
  chrome.storage.sync.set({ user: null }, () => {
    redirect('/views/popup.html')
  })
}

export { post, setPopup, redirect, ensureAuth, getSavedUser, removeUser }
