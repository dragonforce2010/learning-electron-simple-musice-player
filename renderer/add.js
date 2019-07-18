const {
  ipcRenderer
} = require('electron')
const {
  $
} = require('./helper')
const path = require('path')
let musicFilesPath = []

$('select-music').addEventListener('click', () => {
  ipcRenderer.send('open-music-file')
})

$('add-music').addEventListener('click', () => {
  console.log('add.js add-music send event to main', musicFilesPath)
  ipcRenderer.send('add-tracks', musicFilesPath)
})

const renderListHTML = (paths) => {
  const musicList = $('musicList')
  const musicItemsHTML = paths.reduce((html, musicPath) => {
    html += `<li class="list-group-item">${path.basename(musicPath)}</li>`
    return html
  }, '')
  musicList.innerHTML = `<ul class='list-goup'>${musicItemsHTML}</ul>`
}


ipcRenderer.on('selected-file', (event, path) => {
  if (Array.isArray(path)) {
    musicFilesPath = path
    renderListHTML(path)
  }
})