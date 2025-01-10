import { useState } from 'react'
import './App.css'
import SpotifyChart from './SpotifyChart'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <SpotifyChart/>
    </>
  )
}

export default App
