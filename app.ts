// initializing Supabase Client
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://xrlwhuoavozccpjlonwt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhybHdodW9hdm96Y2Nwamxvbnd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA4NzkzOTAsImV4cCI6MTk5NjQ1NTM5MH0.PAn_QvkjUZ3hh_nZP3b9Grwqe91UeoMEPJPI5d4Q5qU";

const supabase = createClient(supabaseUrl, supabaseKey);

// html elements

const loginButton = document.getElementById("signin-button");


// Event Listeners

loginButton.addEventListener("click", () => {
    console.log("clicked");
    supabase.auth.signIn({
        provider: "google"
    })
});