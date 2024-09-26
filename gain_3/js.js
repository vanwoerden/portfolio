document.addEventListener('DOMContentLoaded', (event) => {
    console.log("loaded");
    const thumb = document.querySelector('input[type="range"]');
    console.log(thumb);

    // Add an event listener to the thumb
    thumb.addEventListener('mousedown', function() {
        document.getElementById("volume-value-container").style.opacity = 1;
    });
    thumb.addEventListener('mouseup', function() {
        document.getElementById("volume-value-container").style.opacity = 0.4;
    });
    thumb.addEventListener('touchmove', function(event){
        //event.preventDefault();
    });
  });
function updateVolumeValueField(value) {
    document.getElementById("volval").innerHTML = value;
  }

  