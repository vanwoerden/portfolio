// document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    var timeToggle = document.getElementById("timeToggle");
    var scopeToggle = document.getElementById("scopeToggle");
    console.log("hi");

    document.querySelectorAll('.nav-link').forEach((elem) => {
        elem.addEventListener('click', handleClickLink);
        console.log(elem+ " listener added");
    });
// });

    function handleClickLink(event) {
        event.preventDefault();
        const block = event.target.dataset.link;
        console.log(event.target);
        console.log("block: "+block);
        document.getElementById(block).scrollIntoView({ behavior: ""});
    }

    function fixedTime(){
        console.log("fixedTime");
        var timeToggle = document.getElementById("time");
        var scopeToggle = document.getElementById("scope");

        scopeToggle.checked = false;
    }

    function fixedScope(){
        console.log("fixedScope");
        var timeToggle = document.getElementById("time");
        var scopeToggle = document.getElementById("scope");
        //console.log(timeToggle);

        timeToggle.checked = false;
    }

    function tldr() {
        var tldrToggle = document.getElementById("tldr");
        console.log("tldr " + tldrToggle.checked);

        if(tldrToggle.checked) {
            const elements = document.querySelectorAll(".nermal");
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.add("hidden");
            }
        } else {
            const elements = document.querySelectorAll(".nermal");
            for (let i = 0; i < elements.length; i++) {
                elements[i].classList.remove("hidden");
            }
        }
        
    }

    var rotated = false;
    function rotateBML() {
        console.log("rotateBML");
        document.getElementById("bml-container").classList.add("rotated");
        document.getElementById("build").classList.add("rotated-element");
        document.getElementById("measure").classList.add("rotated-element");
        document.getElementById("learn").classList.add("rotated-element");
        document.getElementById("learn").innerHTML = "Learn first";
        document.getElementById("build").innerHTML = "Then build";
        document.getElementById("measure").innerHTML = "Then measure";
        document.getElementById("reset").innerHTML = "(reset)";
        document.getElementById("bml-title").innerHTML = "Learn, build, measure.";
        rotated = true;
    }

    function rotateBMLBack() {
        document.getElementById("bml-container").classList.remove("rotated");
        document.getElementById("build").classList.remove("rotated-element");
        document.getElementById("measure").classList.remove("rotated-element");
        document.getElementById("learn").classList.remove("rotated-element");
        document.getElementById("learn").innerHTML = "Learn";
        document.getElementById("build").innerHTML = "Build";
        document.getElementById("measure").innerHTML = "Measure";
        document.getElementById("reset").innerHTML = "";
        document.getElementById("bml-title").innerHTML = "Build, measure, learn?";
    }