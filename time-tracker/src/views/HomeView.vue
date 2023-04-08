<template>
  <div class="container">
    <h1>Welcome {{ user_name }}!</h1>
    <a href="#" id="loginBtn" >Google Sign-In</a>
    <a href="#" id="logoutBtn" >Logout</a>
  </div>
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
        provider: 'google',
        options: {
          redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT_URL
        }
      }
      )

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

      // check if user is logged in
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          const user = session?.user
          if (user) {
            this.user_name = user?.user_metadata.full_name
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
      )
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

a :hover {
  background-color: transparent;
}

a {
  display: inline-block;
  padding: 0.5rem;
  width: fit-content;
}
</style>