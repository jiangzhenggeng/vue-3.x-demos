import {
  createApp, h, compile,
  reactive, computed, effect, watch,
  onMounted, onUnmounted,
} from '../packages/vue'

let StorageKey = 'as'
let Storage = {
  get (key) {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]')
    } catch (e) {
      return []
    }
  },
  save (key, value) {
    localStorage.setItem(key, JSON.stringify(value))
  },
}
let filters = {
  '/all': (todoList) => {
    return todoList.filter(item => item)
  },
  '/active': (todoList) => {
    return todoList.filter(item => !item.completed)
  },
  '/completed': (todoList) => {
    return todoList.filter(item => item.completed)
  },
}

const toDoComponent = {
  render: compile(document.querySelector('#todo-template').innerHTML),
  setup () {
    let state = reactive({
      input: '',
      todoList: Storage.get(StorageKey) || [],
      editTitle: '',
      editItem: null,
      visibility: '/all',
      filteredTodos: computed(() => {
        return filters[state.visibility](state.todoList)
      }),
    })

    watch(effect(() => {
      Storage.save(StorageKey, state.todoList)
    }), {
      deep: true,
    })

    onMounted(() => {
      window.addEventListener('hashchange', hashchange)
      hashchange()
    })
    onUnmounted(() => {
      window.removeEventListener('hashchange', hashchange)
    })

    function hashchange () {
      let hash = window.location.href.match(/#(\/.*)/)
      if (hash && hash[1]) {
        state.visibility = hash[1]
      } else {
        state.visibility = '/all'
      }
    }

    let addTodoList = () => {
      let hasItem = false
      state.todoList.forEach(item => {
        if (item.title === state.input.trim()) {
          hasItem = true
        }
      })
      if (hasItem) {
        return
      }
      state.todoList.push({
        id: Math.random(),
        title: state.input,
        completed: false,
      })
      state.input = ''
    }

    return {
      state,
      keyEnter (e) {
        if (e.keyCode == 13) {
          addTodoList()
        }
      },
      editAction (item) {
        state.editItem = item
      },
      completedEdit (e, id) {
        if (e.keyCode !== 13 && e.type !== 'blur') {
          return
        }

        if (!state.editItem) return
        state.todoList = state.todoList.map(item => {
          if (item.id == id) {
            item.title = e.target.value
          }
          return item
        })

        state.editItem = null
      },
      deleteAction (id) {
        state.todoList = state.todoList.filter(item => item.id !== id)
      },
    }
  },
}


createApp().mount(toDoComponent, '#app')











