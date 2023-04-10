<template>
    <main>
        <h1 class="title">Current Tracking</h1>
        <!-- current tracking duration -->
        <div>
            <h3 id="trackingTime">{{ trackingTime }}</h3>
        </div>
        <br>
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


        this.startInterval(now);
        
        // change button text
        trackingButton.innerHTML = 'Stop Tracking';
        
        await track.start("tracking!", now).then((data) => {
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

        this.stopInterval();
        this.trackingTime = '00:00:00'

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
      async updateTracking() {
        const track = new Track(supabase)
        const { date, error } = await track.getCurrentStartTime()

        if (error) {
          console.log(error)
          return
        }

        const trackingButton = document.getElementById('trackingToggle') as HTMLAnchorElement

        if (date && !this.isIntervalRunning()) {
          this.startInterval(date)

          // change button text
          trackingButton.innerHTML = 'Stop Tracking';
        } else if (!date && this.isIntervalRunning()) {
          // reset tracking time
          this.trackingTime = '00:00:00'

          // stop interval
          this.stopInterval()

          // change button text
          trackingButton.innerHTML = 'Start Tracking';
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
      const { date, error } = await track.getCurrentStartTime()

      if (error) {
        console.log(error)
        topbar.hide()
        return
      }

      if (date) {
        this.startInterval(date)

        // change button text
        const trackingButton = document.getElementById('trackingToggle') as HTMLAnchorElement
        trackingButton.innerHTML = 'Stop Tracking';
      } else {
        this.trackingTime = '00:00:00'
      }

      subscription = supabase
        .channel('public:trackings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'trackings' }, async (payload) => {
          this.updateTracking()
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
}

a {
  display: inline-block;
  padding: 0.5rem;
}
</style>
