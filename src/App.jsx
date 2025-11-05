import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Theory from './pages/Theory';
import Chat from './pages/Chat';
export default function App(){
  return (
    <div className='min-h-screen bg-gray-50 text-gray-900'>
      <nav className='bg-white shadow-sm'>
        <div className='max-w-4xl mx-auto p-4 flex gap-4 items-center'>
          <Link to='/' className='font-semibold text-lg'>Blonding App v2.1</Link>
          <Link to='/theory' className='text-sm'>Теория</Link>
          <Link to='/chat' className='text-sm'>AI</Link>
        </div>
      </nav>
      <main className='max-w-4xl mx-auto p-6'>
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/theory' element={<Theory/>}/>
          <Route path='/chat' element={<Chat/>}/>
        </Routes>
      </main>
    </div>
  )
}
