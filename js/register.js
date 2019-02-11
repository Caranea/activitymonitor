import { post } from './utils.js'
import { urls } from './urls.js'

const registerButton = document.getElementById('register-button')
const successInfo = document.getElementById('info-success')
const failureInfo = document.getElementById('info-failure')

registerButton.addEventListener('click', async () => {
  const registerData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    password2: document.getElementById('password2').value
  }

  const response = await post(urls.register, registerData)
  const responseData = await response.json()

  response.status === 200 ? successInfo.classList.remove('d-none') : successInfo.classList.add('d-none')
  responseData instanceof Array && responseData.length > 0 ? displayErrors(responseData) : failureInfo.classList.add('d-none')
})

function displayErrors (errors) {
  failureInfo.innerHTML = ''
  errors.forEach(el => {
    failureInfo.innerHTML += el.error + '<br>'
  })
  failureInfo.classList.remove('d-none')
}
