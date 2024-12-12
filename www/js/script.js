$(document).ready(function () {
    const apiKey = "b74c6c669b5cc2b5d222b015316be77d";
    let weatherChart; // Declare chart globally to manage destruction

    // Event listener for Get Forecast button
    $("#getForecast").click(function () {
        const location = $("#locationInput").val().trim();

        if (!location) {
            showError("Please enter a city name.");
            return;
        }

        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

        $.getJSON(currentWeatherUrl, function (currentWeatherData) {
            const currentTemp = currentWeatherData.main.temp.toFixed(1);
            const weatherDescription = currentWeatherData.weather[0].description;
            $("#currentTemp").html(`Current Temperature: <strong>${currentTemp}°C</strong>`);

            // Update emoji
            updateWeatherEmoji(weatherDescription);

            fetchForecastData(location);
        }).fail(function () {
            showError("City not found or API error in fetching current temperature.");
        });
    });

    // Event listener for Reset button
    $("#resetApp").click(function () {
        resetApp();
    });

    // Fetch forecast data
    function fetchForecastData(location) {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;

        $.getJSON(forecastUrl, function (data) {
            $("#error").addClass("d-none");
            $("#cityName").text(location);

            const tableBody = $("#forecastTable tbody").empty(); // Clear previous rows
            data.list.slice(0, 8).forEach(item => {
                const utcDate = new Date(item.dt_txt);
                const localDate = new Date(utcDate.getTime());

                const dateTime = localDate.toLocaleString([], {
                    weekday: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                });

                const temp = item.main.temp.toFixed(1);
                const description = capitalize(item.weather[0].description);

                const row = `<tr>
                    <td>${dateTime}</td>
                    <td>${temp}°C</td>
                    <td>${description}</td>
                </tr>`;
                tableBody.append(row);
            });

            const labels = data.list.slice(0, 8).map(item => {
                const utcDate = new Date(item.dt_txt);
                const localDate = new Date(utcDate.getTime());

                return localDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            });
            const temperatures = data.list.slice(0, 8).map(item => item.main.temp);

            const ctx = $("#weatherChart")[0].getContext("2d");
            if (weatherChart) {
                weatherChart.destroy(); // Destroy previous chart instance
            }
            weatherChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Temperature (°C)",
                        data: temperatures,
                        borderColor: "#4CAF50",
                        backgroundColor: "rgba(76, 175, 80, 0.2)",
                        borderWidth: 2,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: "top"
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Time"
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Temperature (°C)"
                            },
                            beginAtZero: false
                        }
                    }
                }
            });
        }).fail(function (jqXHR) {
            if (jqXHR.status === 404) {
                showError("City not found. Please try a different city.");
            } else if (jqXHR.status === 401) {
                showError("Invalid API key. Please check your API configuration.");
            } else {
                showError("An error occurred while fetching the forecast. Please try again later.");
            }
        });
    }

    function resetApp() {
        // Clear input field
        $("#locationInput").val("");

        // Reset city name, temperature, and error message
        $("#cityName").text("Search for a city");
        $("#currentTemp").html("--°C");
        $("#error").addClass("d-none").text("");

        // Reset emoji to default
        $("#weatherEmoji").html("☁️");

        // Clear forecast table
        $("#forecastTable tbody").empty();

        // Destroy the chart if it exists
        if (weatherChart) {
            weatherChart.destroy();
            weatherChart = null;
        }
    }

    function updateWeatherEmoji(description) {
        const emojiMap = {
            clear: "☀️",
            clouds: "☁️",
            rain: "🌧️",
            drizzle: "🌦️",
            thunderstorm: "⛈️",
            snow: "❄️",
            mist: "🌫️",
            fog: "🌫️",
            haze: "🌫️",
            smoke: "💨",
            dust: "🌪️",
        };

        const mainCondition = Object.keys(emojiMap).find(condition =>
            description.toLowerCase().includes(condition)
        );
        const emoji = emojiMap[mainCondition] || "☁️";
        $("#weatherEmoji").html(emoji);
    }

    function showError(message) {
        $("#error").text(message).removeClass("d-none");
    }

    function capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
});
