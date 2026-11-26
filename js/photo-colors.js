document.addEventListener("DOMContentLoaded", () => {
    const photo = document.getElementById("about-photo");
    if (!photo) return;
    const sources = [
        "images/PedroWireframe.png",
        "images/PedroWireframeGreen.png",
        "images/PedroWireframeRed.png",
    ];
    sources.forEach((src) => { new Image().src = src; });
    let current = 0;

    const nextColor = () => {
        current = (current + 1) % sources.length;
        photo.classList.add("fading");
        setTimeout(() => {
            photo.src = sources[current];
            photo.classList.remove("fading");
        }, 200);
    };

    photo.addEventListener("click", nextColor);
    photo.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            nextColor();
        }
    });
});
