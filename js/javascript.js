//Urls
// var currentWeather = "http://api.openweathermap.org/data/2.5/weather?q=" + searchValue + "&appid=7ba67ac190f85fdba2e2dc6b9d32e93c&units=imperial";
// Forecast: "http://api.openweathermap.org/data/2.5/forecast?q=" + searchValue + "&appid=7ba67ac190f85fdba2e2dc6b9d32e93c&units=imperial"
// Icon: "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png"

$(document).ready(function () {
    var apiKey = "30e922552c21f651e398ab194a1b1c83";
    var $temp = $("#temp");
    var $humidity = $("#humidity");
    var $wind = $("#wind");
    var $uv = $("#uv");
    var $city = $("#city");
    var $search = $("#search");
    var $searchBtn = $("#searchBtn");

    var searchArray = localStorage.getItem("localSearch");
    if (searchArray) {
        searchArray = JSON.parse(searchArray);
    } else {
        searchArray = [];
    }

    getSearch();

    // On click event to grab search input/hidden div
    $searchBtn.on("click", function (event) {
        event.preventDefault();
        var search = $search.val();
        $(".hide").removeClass("hide");

        storeSearch(search);
        getWeather(search);
    });

    // function built to create AJAX call from search form input
    function getWeather(search) {
        var queryURL =
            "https://api.openweathermap.org/data/2.5/weather?units=imperial&q=" +
            search +
            "&appid=" +
            apiKey;
        // AJAX call to get current weather 
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (response) {
            var dateString = moment.unix(response.dt).format("MM/DD/YYYY");
            $city.text(response.name + " (" + dateString + ")");
            $temp.text("Temperature: " + response.main.temp + " °F");
            $humidity.text("Humidity: " + response.main.humidity + " %");
            $wind.text("Wind Speed: " + response.wind.speed + " MPH");
            weatherIconUrl =
                "http://openweathermap.org/img/w/" + response.weather[0].icon + ".png";
            weatherImage = $("<img>").attr("src", weatherIconUrl);
            $city.append(weatherImage);
            var latitude = response.coord.lat;
            var longitude = response.coord.lon;
            var uvIndexQueryUrl =
                "https://api.openweathermap.org/data/2.5/uvi?&appid=" +
                apiKey +
                "&lat=" +
                latitude +
                "&lon=" +
                longitude;
            // AJAX call to get UV Index information
            $.ajax({
                url: uvIndexQueryUrl,
                method: "GET"
            }).then(function (returned) {
                $uv.text("UV Index: " + returned.value);

                if (returned.value <= 2) {
                    $uv.addClass("favorable");
                }
                if (returned.value > 2 && returned.value <= 7) {
                    $uv.addClass("moderate");
                }
                if (returned.value > 7) {
                    $uv.addClass("severe");
                }
            });

            // last AJAX call to get forecast information
            var forecastQueryUrl =
                "https://api.openweathermap.org/data/2.5/forecast?q=" +
                search +
                "&appid=" +
                apiKey +
                "&units=imperial";

            $.ajax({
                url: forecastQueryUrl,
                method: "GET"
            }).then(function (result) {
                var day = 1;
                result.list.forEach(function (data) {
                    if (data.dt_txt.includes("15:00")) {
                        $("#Day" + day).text(moment.unix(data.dt).format("MM/DD/YYYY"));
                        $("#forecastSymbol" + day).attr(
                            "src",
                            "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png"
                        );
                        $("#forecastTemp" + day).text("Temp: " + data.main.temp + "°F");
                        $("#forecastHumidity" + day).text(
                            "Humidity: " + data.main.humidity + "%"
                        );
                        day++;
                    }
                });
            });
        });
    }

    // function to store search in localStorage
    function storeSearch(search) {
        // return from function early if submitted search 
        if (search === "" || searchArray.includes(search)) {
            return;
        }
        // localStorage.setItem("search", JSON.stringify(search));
        searchArray.push(search);
        // set array to local storage
        localStorage.setItem("localSearch", JSON.stringify(searchArray));
        // clear input from search form
        $search.val("");

        getSearch();
    }

    // function built to get search from localStorage
    function getSearch() {
        // clear out button
        $("#listOfCities").empty();
        // run for loop to dynamically add div and button 
        for (var i = 0; i < searchArray.length; i++) {
            var div = $("<div>");
            var button = $("<button>");
            button.attr("class", "btn-lg btn-block city").text(searchArray[i]);
            button.attr("id", searchArray[i]);

            // prepending div to DOM and appending button 
            $("#listOfCities").prepend(div);
            div.append(button);
        }
    }

    $("#listOfCities").on("click", ".city", function (e) {
        e.preventDefault();
        var search = $(this).text();
        $(".hide").removeClass("hide");
        getWeather(search);
    });
});