document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    const tour = document.getElementById("tour-select");
    console.log(tour);
    console.log(tour.value);

    tour.onchange = function(){
        console.log(tour.value);
        var tourPara = document.getElementById("tour-paragraph");
        switch(tour.value) {
            case "specific-artwork":
                tourPara.innerHTML = "There it is: In the Studio by George Hendrik Breitner. You stop and look at an artwork in detail. You read the little card next to it. You take a look at the work up close. You sit down on the bench a few meters away and drink in the work and the surroundings from afar. You close your eyes. You spend a hour, maybe a few."
        }
    }
  });