

const form = document.getElementById('form')
const modalBtn = document.getElementById('modal-btn')
const input = form.querySelector('#question-input')
const submitBtn = form.querySelector('#submit')




form.addEventListener('submit', submitFormHandler)
modalBtn.addEventListener('click', openModal)
input.addEventListener('input', () => {
    submitBtn.disabled = !isValid(input.value)
})

class Question {
    static create(question) {
       return fetch('https://podcast-list-app-default-rtdb.firebaseio.com/questions.json', {
           method: 'POST',
           body: JSON.stringify(question),
           headers: {
               'Content-Type': 'application/json'
           }
       })
       .then(response => response.json())
       .then(response => {
           question.id = response.name
           return question
       })
       .then(addToLocalStorage)
       .then(Question.renderList) 
    }

    static fetch(token) {
        if (!token) {
            return Promise.resolve('<p class="error">У вас нет токена</p>')
        }
        return fetch(`https://podcast-list-app-default-rtdb.firebaseio.com/questions.json?auth=${token}`)
        .then(response => response.json())
        .then(questions => {
            console.log('Questions', questions)
        })

    }

    static renderList() {
        const questions = getQuestionsFromLocalStorage()

        const html = questions.length
        ? questions.map(toCard).join('')
        : ` <div class="mui--text-headline">Вы пока ничего не спрашивали.</div>`
        const list = document.getElementById('list')
        list.innerHTML = html
    }
   }

   function addToLocalStorage(question) {
       const all = getQuestionsFromLocalStorage()
       all.push(question)
       localStorage.setItem('questions', JSON.stringify(all))
   }

   function getQuestionsFromLocalStorage() {
    return JSON.parse(localStorage.getItem('questions') || '[]')
   }

   function toCard(question) {
     return `
     <div class="mui--text-black-54">
      ${new Date(question.date).toLocaleDateString()}
      ${new Date(question.date).toTimeString()}
     </div>
     <div>
     ${question.text}
     </div>
     <br>`
   }

function isValid(value) {
    return value.length >= 10
    }
function submitFormHandler(event) {
    event.preventDefault()

    if (isValid(input.value)) {
       const question = {
        text: input.value.trim(),
        date: new Date().toJSON()
       }

       submitBtn.disabled = true
        Question.create(question).then( () => {
            input.value = ''
            input.className = ''
            submitBtn.disabled = false
        })

       console.log('Question', question)

       
    }

}
function createModal(title, content) {
  const modal = document.createElement('div')
  modal.classList.add('modal')

  const html = `
  <h1>${title}</h1>
  <div class="modal-content">${content}</div>
  `
  modal.innerHTML = html
  mui.overlay('on', modal)
}



function openModal() {
 createModal('Авторизация', getAuthForm())
 document
 .getElementById('auth-form')
 .addEventListener('submit', authFormHeandler, {once: true})
}


function authFormHeandler(event) {
    event.preventDefault()
    const email = event.target.querySelector('#email').value
    const password = event.target.querySelector('#password').value

    authWithEmailAndPassword(email, password)
    .then(token => {
      return Question.fetch(token)
    })
    .then(renderModalAfterAuth)
   }

function renderModalAfterAuth(content) {
    console.log('Content', content)
}


function getAuthForm() {
 return `
 <form class="mui-form" id="auth-form">
            <div class="mui-textfield mui-textfield--float-label">
              <input type="email" id="email" required>
              <label for="email">Email</label>
            </div>

            <div class="mui-textfield mui-textfield--float-label">
              <input type="password" id="password" required>
              <label for="password">Пароль</label>
            </div>
        
            <button 
            type="submit" 
            class="mui-btn mui-btn--raised mui-btn--primary">Войти</button>
          </form>
 `
}

function authWithEmailAndPassword(email, password) {
    const apiKey = 'AIzaSyCo1rKHBCsje7qcjUAqHUAUhZ1f417RDbg'
  return fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`, {
    method: 'POST',
    body: JSON.stringify( {
        email, password,
        returnSecureToken: true
    }),
    headers: {
        'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => data.idToken)
}



window.addEventListener('load', Question.renderList)


