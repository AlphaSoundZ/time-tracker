<template>
  <main>
    <h1>Welcome {{ user_name }}!</h1>
    <a href="#" id="loginBtn" @click="signIn">Google Sign-In</a>
    <a href="#" id="logoutBtn">Logout</a>
  </main>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

export default {
  data() {
    return {
      user_name: ''
    }
  },
  methods: {
    async signIn() {
      supabase.auth.signInWithOAuth({
        provider: 'google'
      })

      this.updateUI()
    },
    async signOut() {
      await supabase.auth.signOut()

      console.log('signing out')
      this.updateUI()
    },
    async updateUI() {
      const signinButton = document.getElementById('loginBtn')
      const logoutButton = document.getElementById('logoutBtn')

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (user) {
        this.user_name = user.user_metadata.full_name

        if (signinButton && logoutButton) {
          signinButton.style.display = 'none'
          logoutButton.style.display = 'block'
        }
      } else {
        this.user_name = 'Guest'

        if (signinButton && logoutButton) {
          signinButton.style.display = 'block'
          logoutButton.style.display = 'none'
        }
      }
    }
  },
  async mounted() {
    const signinButton = document.getElementById('loginBtn')
    const logoutButton = document.getElementById('logoutBtn')

    logoutButton?.addEventListener('click', this.signOut)
    signinButton?.addEventListener('click', this.signIn)

    this.updateUI()
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
</style>
