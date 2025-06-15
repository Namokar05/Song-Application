
let audio; // global audio object
function formatTime(seconds) {
    let min = Math.floor(seconds / 60);
    let sec = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
}
let currentSong = new Audio();
async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1]);
        }
    }
    return songs;
}


const playMusic = (track) => {
    // let audio=new Audio("/songs/"+track)
    currentSong.src = "/songs/" + track
    currentSong.play()
    document.getElementById("songinfo").innerText = track.replaceAll("%20", " ").replace(".mp3", "");



    const iconShape = document.getElementById("iconShape");
    iconShape.setAttribute("d", "M18 16H21V32H18zM27 16H30V32H27z");

    const seekbar = document.getElementById("seekbar");
    const circle = document.getElementById("circle");
    const currentTimeDisplay = document.getElementById("currentTime");
    const totalTimeDisplay = document.getElementById("totalTime");

    currentSong.addEventListener("timeupdate", () => {
        // Calculate percentage
        let percent = (currentSong.currentTime / currentSong.duration) * 100;
        circle.style.left = percent + "%";

        // Update current time display
        currentTimeDisplay.innerText = formatTime(currentSong.currentTime);

    });
    seekbar.addEventListener("click", (e) => {
        let percent = e.offsetX / seekbar.clientWidth;
        currentSong.currentTime = percent * currentSong.duration;

    });
    let isDragging = false;

    circle.addEventListener("mousedown", () => {
        isDragging = true;
    });

    document.addEventListener("mouseup", (e) => {
        if (isDragging) {
            const rect = seekbar.getBoundingClientRect();
            let offsetX = e.clientX - rect.left;
            offsetX = Math.max(0, Math.min(offsetX, rect.width));
            const percent = offsetX / rect.width;

            // Update song time on mouse up
            currentSong.currentTime = percent * currentSong.duration;
        }
        isDragging = false;
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const rect = seekbar.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        offsetX = Math.max(0, Math.min(offsetX, rect.width));
        const percent = offsetX / rect.width;

        // Just move the circle (don't update audio time here)
        circle.style.left = `${percent * 100}%`;
    });


    // Update total time when metadata loads
    currentSong.addEventListener("loadedmetadata", () => {
        totalTimeDisplay.innerText = formatTime(currentSong.duration);
    });
};

async function main() {

    let songs = await getSongs();
    // console.log("Songs:", songs);

    let songUL = document.querySelector(".songlist ul");
    for (const song of songs) {
        songUL.innerHTML += `<li><img src="music.svg" class="songicon">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Namokar</div>
                            </div>
                            <svg width="25" height="48" viewBox="0 0 48 48" style="cursor: pointer;"
                                xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="24" fill="#1FDF64" />
                                <path d="M19 16L33 24L19 32V16Z" fill="black" />
                            </svg>

                            <div class="playnow">
                                <span>Play Now</span> 

                            </div> </li>`;
    }

    //Attach event listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)

        })
    })

    // attach an event listner to play next and previous song
    const iconShape = document.getElementById("iconShape");
    const playPauseBtn = document.getElementById("playPauseBtn");

    playPauseBtn.addEventListener("click", () => {
        if (!currentSong.src) {
            alert("No song selected!");
            return;
        }

        if (currentSong.paused) {
            currentSong.play().then(() => {
                iconShape.setAttribute("d", "M18 16H21V32H18zM27 16H30V32H27z"); // Pause icon
            }).catch(err => {
                console.error("Play error:", err);
            });
        } else {
            currentSong.pause();
            iconShape.setAttribute("d", "M19 16L33 24L19 32V16Z"); // Play icon
        }
    });

}

window.onload = function () {
    main();
};




// script to make playbar play pause work
let isPlaying = false;

function togglePlayPause() {
    const icon = document.querySelector(".playbar #iconShape"); // more specific
    if (!icon) {
        console.error("Playbar icon not found!");
        return;
    }

    if (isPlaying) {
        icon.setAttribute("d", "M19 16L33 24L19 32V16Z"); // Play
        audio.pause();
    } else {
        icon.setAttribute("d", "M18 16H21V32H18zM27 16H30V32H27z"); // Pause
        audio.play();
    }

    isPlaying = !isPlaying;
}
