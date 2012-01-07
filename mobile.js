var upButton = document.getElementById("left_button");
var downButton = document.getElementById("right_button");

document.getElementById("start_message").addEventListener("click", start);

upButton.addEventListener("click", function(e) {
    boule.up();
    e.preventDefault();
});
downButton.addEventListener("click", function(e) {
    boule.down();
    e.preventDefault();
});
