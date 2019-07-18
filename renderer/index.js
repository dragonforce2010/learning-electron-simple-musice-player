const { ipcRenderer } = require('electron')
const { $, convertDuration } = require('./helper')
let musicAudio = new Audio()
let allTracks
let currentTrack

$('add-music-button').addEventListener('click', () => {
  ipcRenderer.send('add-music-window')
})

musicAudio.addEventListener('loadedmetadata', () => {
  // 开始渲染播放器状态
  renderPlayerHTML(currentTrack.filename, musicAudio.duration)
})

musicAudio.addEventListener('timeupdate', () => {
  updateProcessHTML(musicAudio.currentTime, musicAudio.duration)
})

const updateProcessHTML = (currentTime, duration) => {
  const progress = Math.floor(currentTime / duration * 100)
  const bar = $('player-progress')
  bar.innerHTML = progress + '%'
  bar.style.width = progress + '%'
  const seeker = $('current-seeker')
  seeker.innerHTML = convertDuration(currentTime)
}

const renderPlayerHTML = (name, duration) => {
  const player = $('player-status')
  const html = `
  <div class="col font-weight-bld">
    正在播放：${name}
  </div>
  <div class="col">
    <span id="current-seeker">00:00</span> / ${ convertDuration(duration)}
  </div>
  `
  player.innerHTML = html
}

const renderListHTML = (tracks) => {
  const tracksList = $('tracksList')
  const tracksListHTML = tracks.reduce((html, track) => {
    html += `<li class="row music-track list-group-item d-flex justify-content-between aligin-items-center">
      <div class="col-10">
        <i class="fas fa-headphones-alt mr-2 text-secondary"></i>
        <b>${track.filename}</b>
      </div>
      <div class="col-2">
        <i class="fas fa-play mr-2" data-id="${track.id}"></i>
        <i class="fas fa-trash-alt" data-id="${track.id}"></i>
      </div>
    </>`
    return html
  }, '')
  const emptyTrackHTML = '<div class="alert-primary">还没有添加任何音乐</div>'
  tracksList.innerHTML = tracks ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTrackHTML
}

ipcRenderer.on('getTracks', (event, tracks) => {
  allTracks = tracks
  renderListHTML(tracks)
})

$('tracksList').addEventListener('click', (event) => {
  event.preventDefault()
  const { dataset, classList } = event.target
  const id = dataset && dataset.id
  if (id) {
    if(classList.contains('fa-play')) {
      if (!currentTrack || currentTrack.id != id) {
        // 重置currentTrack
        currentTrack = allTracks.find(track => track.id == id)
        musicAudio.src = currentTrack.path

        // 重置icon
        const resetIconEle = document.querySelector('.fa-pause')
        if (resetIconEle) {
          resetIconEle.classList.replace('fa-pause', 'fa-play')
        }
      }
      classList.replace('fa-play', 'fa-pause')
      musicAudio.play()
      // 这里开始播放音乐
    } else if (classList.contains('fa-pause')) {
      musicAudio.pause()
      classList.replace('fa-pause', 'fa-play')
    } else if (classList.contains('fa-trash-alt')) {
      ipcRenderer.send('delete-track', id)
    }
  }
})