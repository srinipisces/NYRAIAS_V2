import { useState } from 'react'
import { Routes , Route , Navigate } from 'react-router-dom'
import Dashboard from './content/Dashboard'
import Topbar from './Topbar/Topbar'
import Sidebar from './Sidebar/Sidebar1'
import ActivityWindow from './Activity_Window/ActivityWindow'
import InwardSecurity from './Forms/inwardSecurity'
import RawMaterialSeg from './Forms/RawMaterialSeg'
import InwardLab from './Forms/From_Lab'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='main_container'>
        <Topbar />
        <Sidebar />
        
        <div className='content'>
        <Routes>
          <Route path = "/" element={<Navigate to ="/carbon" replace />}/>
          <Route path = "/carbon" element={<Dashboard />}/>
          <Route path = "/carbon/inwardSecurity" element={<InwardSecurity />}/>
          <Route path = "/carbon/rawMaterialBagged" element={<RawMaterialSeg />}/>
          <Route path = "/carbon/inwardLab" element={<InwardLab />}/>
        </Routes>
        </div>
        <ActivityWindow />
      </div>
    </>
  )
}

export default App
