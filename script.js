document.addEventListener("DOMContentLoaded", function () {
    let existingChart = null; // Store reference to the chart

    // ✅ Fix Emotion Selection & Navigation
    const emotionsForm = document.getElementById("emotionForm"); 
    if (emotionsForm) {
        emotionsForm.addEventListener("submit", function (event) {
            event.preventDefault();
            let selectedEmotions = [];

            document.querySelectorAll("#emotionForm input[type='checkbox']:checked").forEach(checkbox => {
                selectedEmotions.push(checkbox.id.replace(/-/g, ' '));
            });

            let today = new Date().toISOString().split("T")[0];
            let logs = JSON.parse(localStorage.getItem("logs")) || {};
            logs[today] = logs[today] || {};
            logs[today].emotions = selectedEmotions;

            localStorage.setItem("logs", JSON.stringify(logs));
            window.location.href = "daily-log.html"; // ✅ Correct navigation
        });
    }

    // ✅ Fix Activity Selection & Navigation
    const dailyLogForm = document.getElementById("dailyLogForm");
    if (dailyLogForm) {
        dailyLogForm.addEventListener("submit", function (event) {
            event.preventDefault();
            let activities = {
                people: [],
                hobbies: [],
                exercise: [],
                meals: [],
                selfCare: [], // ✅ Added missing category
                events: []
            };

            document.querySelectorAll("#dailyLogForm input[type='checkbox']:checked").forEach(checkbox => {
                let category = checkbox.getAttribute("data-category");
                if (category && activities[category]) {
                    activities[category].push(checkbox.id.replace(/-/g, ' '));
                }
            });

            let today = new Date().toISOString().split("T")[0];
            let logs = JSON.parse(localStorage.getItem("logs")) || {};
            logs[today] = logs[today] || {};
            logs[today].activities = activities;

            localStorage.setItem("logs", JSON.stringify(logs));
            window.location.href = "analysis.html"; // ✅ Correct navigation
        });
    }

    // ✅ Display Data in Analysis Page
    if (document.getElementById("logsContainer")) {
        let logs = JSON.parse(localStorage.getItem("logs")) || {};
        let logsContainer = document.getElementById("logsContainer");
        let emotionsList = document.getElementById("emotionsList");
        let categories = ["people", "hobbies", "exercise", "meals", "selfCare", "events"];
        let emotionTrends = {};

        logsContainer.innerHTML = "";
        emotionsList.innerHTML = "";

        for (let date in logs) {
            let entry = logs[date];
            let entryHTML = `<h3>${date}</h3>`;

            // ✅ Display "Emotions:"
            entryHTML += `<h4>Emotions:</h4>`;
            if (entry.emotions && entry.emotions.length > 0) {
                entryHTML += `<ul>`;
                entry.emotions.forEach(emotion => {
                    entryHTML += `<li>${emotion}</li>`;
                    if (!emotionTrends[emotion]) emotionTrends[emotion] = {};
                    emotionTrends[emotion][date] = (emotionTrends[emotion][date] || 0) + 1;
                });
                entryHTML += `</ul>`;
            } else {
                entryHTML += `<p>No emotions recorded.</p>`;
            }

            // ✅ Display "Activities:"
            entryHTML += `<h4>Activities:</h4>`;
            if (entry.activities) {
                categories.forEach(category => {
                    if (entry.activities[category].length > 0) {
                        entryHTML += `<h5>${category.charAt(0).toUpperCase() + category.slice(1)}:</h5><ul>`;
                        entry.activities[category].forEach(item => {
                            entryHTML += `<li>${item}</li>`;
                        });
                        entryHTML += `</ul>`;
                    }
                });
            } else {
                entryHTML += `<p>No activities recorded.</p>`;
            }

            logsContainer.innerHTML += `<div class="log-entry">${entryHTML}</div>`;
        }

        // ✅ Destroy old chart before creating a new one
        if (existingChart) {
            existingChart.destroy();
        }

        // ✅ Generate Emotion Trends Graph
        let dates = Object.keys(logs).sort();
        let datasets = [];

        Object.keys(emotionTrends).forEach(emotion => {
            let data = dates.map(date => emotionTrends[emotion][date] || 0);
            datasets.push({
                label: emotion,
                data: data,
                fill: false,
                borderColor: getRandomColor(),
                tension: 0.1
            });
        });

        if (document.getElementById("progressChart")) {
            let ctx = document.getElementById("progressChart").getContext("2d");
            existingChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: dates,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: "top" },
                        title: { display: true, text: "Emotional Trends Over Time" }
                    }
                }
            });
        }
    }
});

// ✅ Function to generate random colors for graph lines
function getRandomColor() {
    return `hsl(${Math.random() * 360}, 70%, 50%)`;
}
