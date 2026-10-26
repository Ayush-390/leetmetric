document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-card");

    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }

        const regex = /^[a-zA-Z0-9_-]{1,18}$/;
        if (!regex.test(username)) {
            alert("Invalid Username");
            return false;
        }

        return true;
    }

    function getCountByDifficulty(counts, difficulty) {
        const item = counts.find((count) => count.difficulty === difficulty);
        if (!item) {
            throw new Error(`The response is missing ${difficulty} statistics`);
        }
        return item.count;
    }

    function updateProgress(circle, label, solved, total) {
        const percentage = total === 0 ? 0 : (solved / total) * 100;

        circle.style.setProperty("--progress-degree", `${percentage}%`);
        label.textContent = `${solved}/${total}`;
    }

    function renderSubmissionStats(totalSubmissionNum) {
        cardStatsContainer.replaceChildren();

        [
            ["All", "Overall Submissions"],
            ["Easy", "Overall Easy Submissions"],
            ["Medium", "Overall Medium Submissions"],
            ["Hard", "Overall Hard Submissions"],
        ].forEach(([difficulty, title]) => {
            const submission = totalSubmissionNum.find(
                (count) => count.difficulty === difficulty
            );
            if (!submission) {
                throw new Error(`The response is missing ${difficulty} statistics`);
            }

            const card = document.createElement("div");
            const heading = document.createElement("h4");
            const details = document.createElement("p");

            card.className = "card";
            heading.textContent = title;
            details.textContent = submission.submissions;
            card.append(heading, details);
            cardStatsContainer.appendChild(card);
        });
    }

    async function fetchUserDetails(username) {
        

        searchButton.textContent = "Searching...";
        searchButton.disabled = true;

        try {
            const proxyUrl = "https://cors-anywhere.herokuapp.com/";
            const targetUrl = "https://leetcode.com/graphql/";
            const requestOptions = {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                },
                body: JSON.stringify({
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
                    variables: { username },
                }),
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the user details");
            }

            const result = await response.json();
            if (result.errors?.length) {
                throw new Error(result.errors[0].message);
            }
            if (!result.data?.matchedUser) {
                throw new Error("No LeetCode user found with that username");
            }

            const { allQuestionsCount } = result.data;
            const { acSubmissionNum, totalSubmissionNum } =
                result.data.matchedUser.submitStats;

            updateProgress(
                easyProgressCircle,
                easyLabel,
                getCountByDifficulty(acSubmissionNum, "Easy"),
                getCountByDifficulty(allQuestionsCount, "Easy")
            );
            updateProgress(
                mediumProgressCircle,
                mediumLabel,
                getCountByDifficulty(acSubmissionNum, "Medium"),
                getCountByDifficulty(allQuestionsCount, "Medium")
            );
            updateProgress(
                hardProgressCircle,
                hardLabel,
                getCountByDifficulty(acSubmissionNum, "Hard"),
                getCountByDifficulty(allQuestionsCount, "Hard")
            );
            renderSubmissionStats(totalSubmissionNum);
            statsContainer.style.display = "block";
        } catch (error) {
            alert(error.message || "An error occurred while fetching user details");
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    searchButton.addEventListener("click", function () {
        const username = usernameInput.value;

        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});