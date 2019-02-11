/* global chrome */

import { post, setPopup, redirect } from './utils.js'
import { urls } from './urls.js'

const loginButton = document.getElementById('login-button')
const failureInfo = document.getElementById('info-failure')

loginButton.addEventListener('click', async () => {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const response = await post(urls.login, { email, password })
  const responseData = await response.json()

  response.status === 200 && saveSession(responseData)
  responseData instanceof Array && responseData.length > 0 ? failureInfo.classList.remove('d-none') : failureInfo.classList.add('d-none')
})

function saveSession (userData) {
  setPopup('/views/dashboard.html')
  chrome.storage.sync.set({ user: userData.user }, () => {
    console.log('li')
    redirect('/views/dashboard.html')
  })
}
