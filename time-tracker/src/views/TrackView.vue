<template>
    <main>
        <h1 class="title">Current Tracking</h1>

        <!-- tracking title textfield -->
        <div class="tracking-container">
          <div class="tracking-title-container">
            <input class="tracking-title" type="text" placeholder="Title" id="titleInput" @change="updateTitle">
          </div>
          <h3 class="tracking-time" id="trackingTime">{{ trackingTime }}</h3>
        </div>
        <a id="trackingToggle" class="button is-primary" href="#" @click="toggleTracking">Start Tracking</a>
    </main>
</template>

<script lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

import { Track } from '@/utils/track'

import topbar from 'topbar'

let intervalType: any = null

let subscription: any = null

export default {
    name: 'TrackView',
    data() {
        return {
            trackingTime: '',
            intervalId: intervalType
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


        this.startInterval(now);
        
        // change button text
        trackingButton.innerHTML = 'Stop Tracking';
        
        await track.start(titleInput.value, now).then((data) => {
          if (data.error) {
            console.log(data.error)

            // change button text
            trackingButton.innerHTML = 'Start Tracking';

            // stop interval
            this.stopInterval()

            // reset tracking time
            this.trackingTime = '--:--:--'
          } else {
            console.log("tracking started!")
          }

          return
        });
        return
      },
      async stopTracking() {
        const now = new Date()
        const track = new Track(supabase)
        const trackingButton = document.getElementById('trackingToggle') as HTMLAnchorElement
        const titleInput = document.getElementById('titleInput') as HTMLInputElement

        this.stopInterval();
        this.trackingTime = '00:00:00'
        titleInput.value = ''

        // sessionStorage of tracking title
        sessionStorage.removeItem('trackingTitle')

        // change button text
        trackingButton.innerHTML = 'Start Tracking';

        await track.stop(now).then((data) => {
          if (data.error) {
            console.log(data.error)
          }

          console.log("tracking stopped!")
          return
        });
        return
      },
      async updateTracking(params: any) { // handle tracking changes
        const track = new Track(supabase)
        const { data, error } = await track.getCurrentTracking()
        const date = data?.start ? new Date(data.start) : null

        if (error) {
          console.log(error)
          return
        }

        const trackingButton = document.getElementById('trackingToggle') as HTMLAnchorElement
        const titleInput = document.getElementById('titleInput') as HTMLInputElement

        if (date && !this.isIntervalRunning()) { // tracking has changed to running
          console.log("tracking has changed to running")
          this.startInterval(date)

          // change button text
          trackingButton.innerHTML = 'Stop Tracking';
        } else if (!date && this.isIntervalRunning()) { // tracking has changed to stopped
          console.log("tracking has changed to stopped")
          // reset tracking time and title
          this.trackingTime = '00:00:00'
          titleInput.value = ''

          // sessionStorage of tracking title
          sessionStorage.removeItem('trackingTitle')

          // stop interval
          this.stopInterval()

          // change button text
          trackingButton.innerHTML = 'Start Tracking';
        }

        if (this.isIntervalRunning()) {
          // update title only if tracking is running
          titleInput.value = params.title?.toString() || ''

          // sessionStorage of tracking title
          sessionStorage.setItem('trackingTitle', titleInput.value)
        }
        else {
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
        
        const result = await track.update({title: titleInput.value}, null)
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
      const { data, error } = await track.getCurrentTracking()
      const date = data?.start ? new Date(data.start) : null

      if (error) {
        console.log(error)
        topbar.hide()
        return
      }

      if (!date) {
        this.trackingTime = '00:00:00'
      }

      this.updateTracking(data)

      subscription = supabase
        .channel('public:trackings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trackings' }, async (payload) => {
          // only new values
          this.updateTracking(payload.new)
        })
        .subscribe()

      topbar.hide()
    },
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

</style>
