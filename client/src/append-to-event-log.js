import { eventLogElement } from './constants'

const appendToEventLog = message => {
  const el = document.createElement('li')

  el.innerText = message
  eventLogElement.appendChild(el)

  eventLogElement.scrollTop = eventLogElement.scrollHeight
}

export default appendToEventLog
