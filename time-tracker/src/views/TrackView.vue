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

export default {
    name: 'TrackView',
    data() {
        return {
            trackingTime: '00:00:00',
            intervalId: setInterval(() => { }, 1000)
        }
    },
    methods: {
      async toggleTracking() {
        const trackingButton = document.getElementById('trackingToggle') as HTMLAnchorElement
        const track = new Track(supabase)
        const now = new Date()

        // get current tracking
        const { date, error } = await track.getCurrentTrackingStartTime()
        
        if (error) {
          console.log(error)
          return
        }

        if (date) {
          // stop tracking
          const updateData = await track.stop(now);

          if (updateData.error) {
            console.log(updateData.error)
            return
          }

          // stop interval
          this.stopIntervall();
          this.trackingTime = '00:00:00'

          trackingButton.innerHTML = 'Start Tracking';
          return
        }
        else {
          // start tracking
          const result = await track.start("tracking!", now)
          this.startIntervall(now);
        }

        // change button text
        trackingButton.innerHTML = 'Stop Tracking';
      },
      startIntervall(start: Date) {
        this.intervalId = setInterval(() => {
          const now = new Date()
          const diff = now.getTime() - start.getTime()
          const diffDate = new Date(diff)

          // format time
          const hours = diffDate.getUTCHours().toString().padStart(2, '0')
          const minutes = diffDate.getUTCMinutes().toString().padStart(2, '0')
          const seconds = diffDate.getUTCSeconds().toString().padStart(2, '0')

          this.trackingTime = `${hours}:${minutes}:${seconds}`
        }, 1000)
      },
      stopIntervall() {
        clearInterval(this.intervalId)
      }
    },
    setup() {
      const trackingTime = ref('00:00:00')

      return {
        trackingTime
      }
    },
    async mounted() {
      const track = new Track(supabase)
      const { date, error } = await track.getCurrentTrackingStartTime()

      if (error) {
        console.log(error)
        return
      }

      if (date) {
        this.startIntervall(date)

        // change button text
        const trackingButton = document.getElementById('trackingToggle') as HTMLAnchorElement
        trackingButton.innerHTML = 'Stop Tracking';
      }
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
