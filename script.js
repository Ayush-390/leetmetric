    document.addEventListener("DOMContentLoaded", function(){
    const searchButton=document.getElementById("search-btn");
    const usernameInput=document.getElementById("user-input");
    const statsContainer=document.querySelector(".stats-container");
    const easyProgressCircle=document.querySelector(".easy-progress");
    const mediumProgressCircle=document.querySelector(".medium-progress");
    const hardProgressCircle=document.querySelector(".hard-progress");
    const easyLabel=document.getElementById("easy-label");
    const mediumLabel=document.getElementById("medium-label")
    const hardLabel=document.getElementById("hard-label");
    const cardStatsContainer=document.querySelector(".stats-card");
    
   //return true or false based on a regex
    function validateUsername(username){
       if(username.trim() === ""){
         alert("Username should not be empty");
         return false;
       }
       const regex = /^[a-zA-Z0-9_-]{1,18}$/;
       const isMatching=regex.test(username);
       if(!isMatching){
         alert("Invalid Username");
       }
       return isMatching;
    }
    try {
    searchButton.textContent = "Searching...";
    searchButton.disabled = true;

    // const response = await fetch(url);
    const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const targetUrl = 'https://leetcode.com/graphql/';
    
    // Concatenation of both URL (if you plan to use it: const url = proxyUrl + targetUrl;)
    const myHeaders = new Headers();
    myHeaders.append("content-type", "application/json");

    const graphql = JSON.stringify({
        query: `
            query userSessionProgress($username: String!) {
                allQuestionsCount {
                    difficulty
                    count
                }
                matchedUser(username: $username) {
                    submitStats {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                        totalSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                }
            }
        `,
        variables: { "username": username }
    });

} catch (error) {
    console.error("Error during search:", error);
    // Remember to re-enable your button here if an error occurs
    searchButton.textContent = "Search";
    searchButton.disabled = false;
}
