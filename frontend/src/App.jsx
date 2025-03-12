import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import EditorPage from "./pages/Editor"
import { Toaster } from "react-hot-toast"


function App() {
  

  return (
    <>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor/:roomId" element={<EditorPage />} />
       

      </Routes>
      <Toaster />
      
    </>
  )
}

export default App
