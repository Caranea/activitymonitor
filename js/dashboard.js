/* global fetch, moment */

import { urls } from './urls.js'
import { removeUser, getSavedUser } from './utils.js'

console.log(moment)

const logoutButton = document.getElementById('logout')

logoutButton.addEventListener('click', () => {
  logout()
})

async function logout () {
  let response = await fetch(urls.logout)
  response.status === 200 && removeUser()
}

async function downloadRaport (from, to) {
  const savedUser = await getSavedUser()
  const response = await fetch(`${urls.report}/${savedUser.user._id}/?from=${moment().subtract(1, 'days').format('YYYY-MM-DDTHH:mm:ss')}&to=${moment().format('YYYY-MM-DDTHH:mm:ss')}`)
  console.log(response)
}

downloadRaport()
