import {useState, useEffect} from 'react'


function App() {

  const healthState =  useState("checking...")
  const health = healthState[0]
  const setHealth = healthState[1]

  useEffect(() => {
    fetch("http://localhost:8080/api/health")
      .then((response) => response.json())
      .then((data) => setHealth(data.status))
      .catch((error) => {
        console.error("Error fetching health status:", error)
        setHealth(error.message)
      })
  }, [])

  return (
    <div>
      <h1>Purchase Tracker</h1>
      <p>Health Status: {health}</p>
    </div>
  )
}

export default App