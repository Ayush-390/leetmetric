document.addEventListener("DOMContentLoaded", function () {
    const elements = {
        searchButton: document.getElementById("search-btn"),
        usernameInput: document.getElementById("user-input"),
        statsContainer: document.querySelector(".stats-container"),
        easyProgressCircle: document.querySelector(".easy-progress"),
        mediumProgressCircle: document.querySelector(".medium-progress"),
        hardProgressCircle: document.querySelector(".hard-progress"),
        easyLabel: document.getElementById("easy-label"),
        mediumLabel: document.getElementById("medium-label"),
        hardLabel: document.getElementById("hard-label"),
        cardStatsContainer: document.querySelector(".stats-card"),
        searchMessage: document.getElementById("search-message"),
    };

    if (Object.values(elements).some((element) => element === null)) {
        console.error("The page is missing elements required by the stats tracker.");
        return;
    }

    const {
        searchButton,
        usernameInput,
        statsContainer,
        easyProgressCircle,
        mediumProgressCircle,
        hardProgressCircle,
        easyLabel,
        mediumLabel,
        hardLabel,
        cardStatsContainer,
        searchMessage,
    } = elements;
    let isSearching = false;

    class UserFacingError extends Error {}

    function showMessage(message) {
        searchMessage.textContent = message;
        searchMessage.hidden = message === "";
    }

    function validateUsername(username) {
        if (username.trim() === "") {
            showMessage("Please enter a LeetCode username.");
            return false;
        }

        const regex = /^[a-zA-Z0-9_-]{1,18}$/;
        if (!regex.test(username)) {
            showMessage("Please enter a valid username (1-18 letters, numbers, underscores, or hyphens).");
            return false;
        }

        return true;
    }

    function getCountByDifficulty(counts, difficulty) {
        if (!Array.isArray(counts)) {
            throw new UserFacingError("Question statistics are missing from the response.");
        }

        const item = counts.find((count) => count.difficulty === difficulty);
        if (!item || !Number.isFinite(item.count)) {
            throw new UserFacingError(`The ${difficulty} question statistics are missing.`);
        }
        return item.count;
    }

    function upDateProgress(solved, total, label, circle) {
        const percentage = total === 0 ? 0 : (solved / total) * 100;

        circle.style.setProperty("--progress-degree", `${percentage}%`);
        label.textContent = `${solved}/${total}`;
    }

    function renderSubmissionStats(totalSubmissionNum) {
        if (!Array.isArray(totalSubmissionNum)) {
            throw new UserFacingError("Submission statistics are missing from the response.");
        }

        const cardData = [
            ["All", "Overall Submissions"],
            ["Easy", "Overall Easy Submissions"],
            ["Medium", "Overall Medium Submissions"],
            ["Hard", "Overall Hard Submissions"],
        ].map(([difficulty, title]) => {
            const submission = totalSubmissionNum.find(
                (count) => count.difficulty === difficulty
            );
            if (!submission || !Number.isFinite(submission.submissions)) {
                throw new UserFacingError(`The ${difficulty} submission statistics are missing.`);
            }

            return { title, value: submission.submissions };
        });

        const cards = cardData.map(({ title, value }) => {
            const card = document.createElement("div");
            const heading = document.createElement("h4");
            const details = document.createElement("p");

            card.className = "card";
            heading.textContent = title;
            details.textContent = String(value);
            card.append(heading, details);
            return card;
        });

        cardStatsContainer.replaceChildren(...cards);
    }

    function displayUserData(parsedData) {
        const matchedUser = parsedData?.data?.matchedUser;
        if (!matchedUser) {
            throw new UserFacingError("No LeetCode user was found with that username.");
        }

        const allQuestionsCount = parsedData.data.allQuestionsCount;
        const submitStats = matchedUser.submitStats;
        if (!submitStats) {
            throw new UserFacingError("User statistics are unavailable. Please try again later.");
        }

        const acceptedSubmissions = submitStats.acSubmissionNum;
        const progressData = [
            {
                difficulty: "Easy",
                label: easyLabel,
                circle: easyProgressCircle,
            },
            {
                difficulty: "Medium",
                label: mediumLabel,
                circle: mediumProgressCircle,
            },
            {
                difficulty: "Hard",
                label: hardLabel,
                circle: hardProgressCircle,
            },
        ].map(({ difficulty, label, circle }) => ({
            solved: getCountByDifficulty(acceptedSubmissions, difficulty),
            total: getCountByDifficulty(allQuestionsCount, difficulty),
            label,
            circle,
        }));

        renderSubmissionStats(submitStats.totalSubmissionNum);
        progressData.forEach(({ solved, total, label, circle }) => {
            upDateProgress(solved, total, label, circle);
        });
        statsContainer.style.display = "block";
    }

    function clearDisplayedStats() {
        statsContainer.style.display = "none";
        cardStatsContainer.replaceChildren();
        [
            [easyLabel, easyProgressCircle],
            [mediumLabel, mediumProgressCircle],
            [hardLabel, hardProgressCircle],
        ].forEach(([label, circle]) => {
            label.textContent = "";
            circle.style.setProperty("--progress-degree", "0%");
        });
    }

    async function fetchUserDetails(username) {
        if (isSearching) {
            return;
        }

        isSearching = true;
        searchButton.textContent = "Searching...";
        searchButton.disabled = true;
        showMessage("");

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

            let response;
            try {
                response = await fetch(proxyUrl + targetUrl, requestOptions);
            } catch {
                throw new UserFacingError(
                    "Unable to connect to LeetCode. Check your connection and try again."
                );
            }

            if (!response.ok) {
                throw new UserFacingError(
                    "The LeetCode request was unsuccessful. The service or CORS proxy may be unavailable."
                );
            }

            let parsedData;
            try {
                parsedData = await response.json();
            } catch {
                throw new UserFacingError(
                    "The server returned an unreadable response. Please try again."
                );
            }

            if (parsedData.errors?.length) {
                throw new UserFacingError(
                    "LeetCode could not complete the request. Check the username and try again."
                );
            }

            displayUserData(parsedData);
        } catch (error) {
            if (error instanceof UserFacingError) {
                showMessage(error.message);
            } else {
                console.error("Unable to load LeetCode statistics.", error);
                showMessage("Unable to load statistics right now. Please try again.");
            }
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;
            isSearching = false;
        }
    }

    function searchForUser() {
        if (isSearching) {
            return;
        }

        clearDisplayedStats();
        showMessage("");
        const username = usernameInput.value;

        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    }

    searchButton.addEventListener("click", searchForUser);
    usernameInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            searchForUser();
        }
    });
});
