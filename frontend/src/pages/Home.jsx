import React from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {v4 as uuidv4} from 'uuid'

const Home = () => {

  const [roomId, setRoomId] = useState('')
  const [username, setUsername] = useState('')

  const navigate = useNavigate()

  const handleJoinRoom = (e) => {

    e.preventDefault()

    if (!roomId || !username) {
      toast.error('Please enter a room ID and username')
      return
    }


    navigate(`/editor/${roomId}?username=${username}`)
  }

  const handleCreateRoom = (e) => {

    e.preventDefault()

    const newRoomId = uuidv4()
    setRoomId(newRoomId)


    
  }

  return (
    <div className='flex flex-col items-center justify-center h-screen bg-gray-800'>

        

        <div className='flex flex-col items-center justify-center bg-gray-900 p-4 shadow-lg rounded-lg w-96 h-88 border-2 border-cyan-500'> 
            <h1 className='text-3xl font-bold text-cyan-500 mb-4'>Code Editor</h1>
          <input
            type='text'
            placeholder='Room ID'
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className='mb-2 p-3 w-full border-2 border-cyan-500 rounded-lg text-white font-bold'
          />

          <input
            type='text'
            placeholder='Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='mb-2 p-3 w-full border-2 border-cyan-500 rounded-lg text-white font-bold'
          />

          <button
            onClick={handleJoinRoom}
            className='bg-cyan-500 text-white p-3 w-full rounded-lg hover:bg-cyan-600 cursor-pointer' 
          >
            Join Room
          </button>

          <p className='text-white mt-4'> Don't have room id , <a onClick={handleCreateRoom} className='text-blue-500 cursor-pointer hover:underline'>Create Room</a></p>
          
        </div>
      
    </div>
  )
}

export default Home
