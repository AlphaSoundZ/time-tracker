<template>
  <main>
    <h1 class="title">Current Tracking</h1>

    <!-- tracking title textfield -->
    <div class="tracking-container">
      <div class="autocomplete">
        <div class="tracking-title-container">
          <input
            autocomplete="off"
            class="tracking-title"
            type="text"
            placeholder="Title"
            id="titleInput"
            @change="updateTitle"
            @focusin="updateAutocompletion"
            @keyup="updateAutocompletion"
          />
        </div>
        <div class="autocomplete-items">
          <div v-for="item in autocompletionItems" @click="selectAutocompleteItem(item)">
            {{ item.title }} <br />
            <p style="font-size: small">
              {{ new Date(item.last_use).toLocaleDateString() }}
            </p>
          </div>
        </div>
      </div>
      <h3 class="tracking-time" id="trackingTime">{{ trackingTime }}</h3>
      <img src="@/assets/tags_icon.svg" alt="tags" class="tag-button" />
    </div>
    <a id="trackingToggle" class="button is-primary" href="#" @click="toggleTracking"
      >Start Tracking</a>
  </main>
</template>

<script lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'

import { Track } from '@/utils/track'

import topbar from 'topbar'

let intervalType: any = null
let trackingSubscription: any = null

interface TitleData {
  title: string
  amount: number
  last_use: string | number | Date
}

export default {
  name: 'TrackView',
  data() {
    return {
      trackingTime: '',
      intervalId: intervalType,
      autocompletionItems: ref<TitleData[]>([])
    }
  },
  methods: {
    async toggleTracking() {
      topbar.show()

      const trackingButton = document.getElementById('trackingToggle') as HTMLAnchorElement
      const track = new Track(supabase)
      const now = new Date()

      // get current tracking
      const isIntervalRunning = this.isIntervalRunning()

      if (isIntervalRunning) {
        // stop tracking

        this.stopTracking().then(() => {
          topbar.hide()
        })
      } else {
        // start tracking

        this.startTracking().then(() => {
          topbar.hide()
        })
      }

      return
    },
    async startTracking() {
      const now = new Date()
      const track = new Track(supabase)
      const trackingButton = document.getElementById('trackingToggle') as HTMLAnchorElement
      const titleInput = document.getElementById('titleInput') as HTMLInputElement

      this.startInterval(now)

      // change button text
      trackingButton.innerHTML = 'Stop Tracking'

      await track.start(titleInput.value, now).then((data) => {
        if (data.error) {
          console.log(data.error)

          // change button text
          trackingButton.innerHTML = 'Start Tracking'

          // stop interval
          this.stopInterval()

          // reset tracking time
          this.trackingTime = '--:--:--'
        } else {
          console.log('tracking started!')
        }

        return
      })
      return
    },
    async stopTracking() {
      const now = new Date()
      const track = new Track(supabase)
      const trackingButton = document.getElementById('trackingToggle') as HTMLAnchorElement
      const titleInput = document.getElementById('titleInput') as HTMLInputElement

      this.stopInterval()
      this.trackingTime = '00:00:00'
      titleInput.value = ''

      // sessionStorage of tracking title
      sessionStorage.removeItem('trackingTitle')

      // change button text
      trackingButton.innerHTML = 'Start Tracking'

      await track.stop(now).then((data) => {
        if (data.error) {
          console.log(data.error)
        }

        // update autocompletion items
        this.fetchAutocompletionItems()

        console.log('tracking stopped!')
        return
      })
      return
    },
    async updateTracking(params: any) {
      // handle tracking changes
      const track = new Track(supabase)
      const { data, error } = await track.getCurrentTracking()
      const date = data?.start ? new Date(data.start) : null

      if (error) {
        console.log(error)
        return
      }

      const trackingButton = document.getElementById('trackingToggle') as HTMLAnchorElement
      const titleInput = document.getElementById('titleInput') as HTMLInputElement

      if (date && !this.isIntervalRunning()) {
        // tracking has changed to running
        console.log('tracking has changed to running')
        this.startInterval(date)

        // change button text
        trackingButton.innerHTML = 'Stop Tracking'
      } else if (!date && this.isIntervalRunning()) {
        // tracking has changed to stopped
        console.log('tracking has changed to stopped')
        // reset tracking time and title
        this.trackingTime = '00:00:00'
        titleInput.value = ''

        // sessionStorage of tracking title
        sessionStorage.removeItem('trackingTitle')

        // stop interval
        this.stopInterval()

        // change button text
        trackingButton.innerHTML = 'Start Tracking'
      }

      if (this.isIntervalRunning()) {
        // update title only if tracking is running
        titleInput.value = params.title?.toString() || ''

        // sessionStorage of tracking title
        sessionStorage.setItem('trackingTitle', titleInput.value)
      } else {
        // update title from session storage
        titleInput.value = sessionStorage.getItem('trackingTitle') || ''
      }
    },
    startInterval(start: Date) {
      // render at start time
      const now = new Date()
      const diff = now.getTime() - start.getTime()
      const diffDate = new Date(diff)
      this.trackingTime = this.formatDate(diffDate)

      // start interval
      this.intervalId = setInterval(() => {
        const now = new Date()
        const diff = now.getTime() - start.getTime()
        const diffDate = new Date(diff)

        this.trackingTime = this.formatDate(diffDate)
      }, 1000)
    },
    stopInterval() {
      clearInterval(this.intervalId)
      this.intervalId = null
    },
    isIntervalRunning() {
      return this.intervalId != null
    },
    formatDate(diffDate: Date) {
      // format time
      const hours = diffDate.getUTCHours().toString().padStart(2, '0')
      const minutes = diffDate.getUTCMinutes().toString().padStart(2, '0')
      const seconds = diffDate.getUTCSeconds().toString().padStart(2, '0')

      return `${hours}:${minutes}:${seconds}`
    },
    async updateTitle() {
      const titleInput = document.getElementById('titleInput') as HTMLInputElement
      const track = new Track(supabase)

      // sessionStorage of tracking title
      sessionStorage.setItem('trackingTitle', titleInput.value)

      if (this.isIntervalRunning()) await track.update({ title: titleInput.value }, null)
    },
    async updateAutocompletion() {
      const titleInput = document.getElementById('titleInput') as HTMLInputElement

      if (!sessionStorage.getItem('autocompletionItems')) await this.fetchAutocompletionItems()

      const inputString = titleInput.value.toLowerCase()
      const allItems = JSON.parse(sessionStorage.getItem('autocompletionItems') || '[]')

      // check if input is empty
      if (titleInput.value.length == 0) {
        // get latest title
        this.autocompletionItems = allItems.slice(0, 1)
        return
      }

      // check if there is a match
      const matches = allItems.filter((item: TitleData) => {
        return item.title.toLowerCase().includes(inputString)
      })

      // sort matches by amount
      matches.sort((a: TitleData, b: TitleData) => {
        return b.amount - a.amount
      })

      // limit matches to 5
      this.autocompletionItems = matches.slice(0, 3)
    },
    selectAutocompleteItem(item: TitleData) {
      const titleInput = document.getElementById('titleInput') as HTMLInputElement

      // read data from autocomplete item
      const title = item.title

      titleInput.value = title as string
      this.updateTitle()

      // close autocomplete
      this.autocompletionItems = []
    },
    async fetchAutocompletionItems() {
      const track = new Track(supabase)
      const data = await track.getTitles()
      if (data.error) {
        console.log(data.error)
        return
      }

      // set session storage
      sessionStorage.setItem('autocompletionItems', JSON.stringify(data.data))
    }
  },
  setup() {
    const trackingTime = ref('--:--:--')

    topbar.show()

    return {
      trackingTime
    }
  },
  async mounted() {
    const track = new Track(supabase)
    await track.getCurrentTracking().then((response) => {
      const date = response.data?.start ? new Date(response.data.start) : null

      if (response.error) {
        console.log(response.error)
        topbar.hide()
        return
      }
      if (!date) {
        this.trackingTime = '00:00:00'
      }

      this.updateTracking(response.data)
    })

    // fetch titles for autocompletion
    await track.getTitles().then((response) => {
      if (response.error) {
        console.log(response.error)
        return
      }

      // set session storage
      sessionStorage.setItem('autocompletionItems', JSON.stringify(response.data))
    })

    // event listener for clicking changes
    document.addEventListener('click', (e) => {
      // check if click was outside of title input
      const titleInput = document.getElementById('titleInput') as HTMLInputElement

      if (e.target != titleInput) {
        // close autocomplete
        this.autocompletionItems = []
      }
    })

    trackingSubscription = supabase
      .channel('public:trackings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trackings' },
        async (payload) => {
          // only new values
          this.updateTracking(payload.new)
        }
      )
      .subscribe()

    topbar.hide()
  }
}
</script>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}

a :hover {
  background-color: transparent;

  color: #fff;
}

a {
  display: inline-block;
  padding: 0.5rem;
  border-radius: 0.25rem;
}

input:focus {
  outline: none;
}

.tracking-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.tracking-title-container {
  flex: 1;
  min-width: 50%;
}

.tracking-time {
  font-family: Courier bold, monospace;
  font-size: 2rem;
  font-weight: 500;
  margin-left: 5%;
}

.tracking-title {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem;
  font-size: 1.5rem;
  font-weight: 500;
}

/* autocompletion */

.autocomplete {
  position: relative;
  display: inline-block;
  /* width: 100%; */
}

.autocomplete-items {
  position: absolute;
  z-index: 99;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow: hidden;
  border: 1px solid;
  border-top: none;
  border-radius: 0 0 0.25rem 0.25rem;
  border-color: hsla(160, 100%, 37%, 1);
  background: hsla(160, 100%, 37%, 0.2);
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.autocomplete-items:empty {
  border: none; /* Alle Grenzen entfernen, wenn die Dropdown-Liste leer ist */
}

.autocomplete-items div {
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1.2rem;
  transition: 0.4s;
}

.autocomplete-items div:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}

.autocomplete-active {
  background-color: #e9e9e9 !important;
  color: #000;
}

.tag-button {
  cursor: pointer;
  width: 46px;
  color: hsla(160, 100%, 37%, 1);
  padding: 0.5rem;
  margin-left: 5%;
  transition: 0.4s;
  border-radius: 0.25rem;
}

.tag-button:hover {
  background-color: hsla(160, 100%, 37%, 0.2);
}

.tag-button:active {
  background-color: hsla(160, 100%, 37%, 0.4);
}
</style>
