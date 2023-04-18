<template>
  <main>
    <h1 class="title">Current Tracking</h1>

    <trackingBar />
  </main>
</template>

<script lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import trackingBar from '@/components/trackingBar.vue'

import { Track } from '@/utils/track'

import topbar from 'topbar'

export default {
  components: {
    trackingBar
  },
}

</script>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}
</style>
