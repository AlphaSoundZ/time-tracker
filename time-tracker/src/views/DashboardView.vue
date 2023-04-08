<script setup>
import { ref, onMounted } from 'vue'
//import { createClient } from "@supabase/supabase-js";
import { supabase } from '../lib/supabaseClient'

const trackings = ref([])

async function getTrackings() {
  const { data } = await supabase.from('trackings').select()
  trackings.value = data
}

function duration(tracking) {
  // if tracking has not ended, return "in progress"
  if (!tracking.end) {
    return 'in progress'
  }

  // calculate duration
  const start = new Date(tracking.start)
  const end = new Date(tracking.end)
  const duration = end - start

  // convert duration to hours, minutes, seconds
  const hours = Math.floor(duration / 1000 / 60 / 60)
  const minutes = Math.floor(duration / 1000 / 60) % 60
  const seconds = Math.floor(duration / 1000) % 60

  // format duration
  const formattedDuration = [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, '0'))
    .join(':')

  return formattedDuration
}

function formatTime(time) {
  if (!time) return

  // retrun time only
  return new Date(time).toLocaleTimeString().split(' ')[0]
}

function getDate(tracking) {
  let startDate = new Date(tracking.start).toLocaleDateString()

  if (tracking.end) {
    let endDate = new Date(tracking.end).toLocaleDateString()

    if (startDate === endDate) {
      return startDate
    } else {
      return `${startDate} - ${endDate}`
    }
  }

  return startDate
}

onMounted(() => {
  getTrackings()

  // subscribe to realtime updates
  supabase
    .channel('any')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'trackings' }, (payload) => {
      console.log('Change received!', payload)
    })
    .subscribe()
})
</script>

<template>
  <div class="container">
    <h1 class="title">Time Tracker</h1>
    <table class="table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Date</th>
          <th>Start</th>
          <th>End</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tracking in trackings" :key="tracking.id">
          <td>{{ tracking.title }}</td>
          <td>{{ getDate(tracking) }}</td>
          <td>{{ formatTime(tracking.start) }}</td>
          <td>{{ formatTime(tracking.end) }}</td>
          <td>{{ duration(tracking) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.title {
  text-align: center;
  margin-bottom: 2rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  border: 1px solid #3e3e3e;
  padding: 0.5rem;
}

.table th {
  background: #0a0a0a;
}
</style>
