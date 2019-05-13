function initMap() {
  const mapContainer = document.getElementById("map")
  

  if (!mapContainer) return;

  const myMap = new MyMap(mapContainer)
  
  
  myMap.init()
  if(document.getElementById('map').dataset.id === 'yo'){
    addUsersToMap(myMap)
  }
  else {
    addEventToMap(myMap)
  }
}

function addEventToMap(myMap) {
  const id = document.getElementById("map").dataset.id
  axios.get(`/events/${id}/coordinates`)
    .then(response => {
      const position = {
        lat: response.data.coordinates[1],
        lng: response.data.coordinates[0]
      }
      myMap.addMarker(position.lat, position.lng)
      myMap.googleMap.setCenter(position)
      // response.data.forEach(coordinate => {
      //   myMap.addMarker(
      //     coordinate.coordinates[1],
      //     coordinate.coordinates[0]
      //   )
      // })
    })
    .catch(console.log)
}

function addUsersToMap(myMap) {
  const id = document.getElementById("map").dataset.id
  axios.get(`/stats/coordinates`)
    .then(response => {
      const positions = response.data.map(item => {
        const loc = {
          lat: item.coordinates[1],
          lng: item.coordinates[0]
        }
        return loc
      })
      positions.forEach(item => myMap.addMarker(item.lat, item.lng))
      // response.data.forEach(coordinate => {
      //   myMap.addMarker(
      //     coordinate.coordinates[1],
      //     coordinate.coordinates[0]
      //   )
      // })
    })
    .catch(console.log)
}

function onClickAddGame(e) {
  e.preventDefault();

  const gameId = e.target.dataset.gameId;

  e.target.innerText = "Adding..."

  axios.post(`/games/${gameId}/add`)
    .then((response) => {
      e.target.innerText = `Done`;
      e.target.style = 'background-color:grey'
    })
    .catch(console.log)
}

function onClickWishGame(e) {
  e.preventDefault();

  const gameId = e.target.dataset.gameId;

  e.target.innerText = "Adding..."

  axios.post(`/games/${gameId}/wish`)
    .then((response) => {
      e.target.innerText = `Done`;
      e.target.style = 'background-color:grey'
    })
    .catch(console.log)
}

function onClickFollowUser(e) {
  e.preventDefault();

  const userId = e.target.dataset.userId;

  e.target.innerText = "Adding..."

  axios.post(`/users/${userId}/follow`)
    .then((response) => {
      e.target.innerText = `Done`;
      e.target.style = 'background-color:grey'
    })
    .catch(console.log)
}