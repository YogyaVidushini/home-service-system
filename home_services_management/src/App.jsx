import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home             from './Components/Pages/Home'
import Login            from './Components/Pages/Login'
import Register         from './Components/Pages/Register'
import CustomerRegister from './Components/Pages/CustomerRegister'
import WorkerRegister   from './Components/Pages/WorkerRegister'
import Services         from './Components/Pages/Services'
import AdminDashboard   from './Components/Pages/AdminDashboard'
import WorkerDashboard  from './Components/Pages/WorkerDashboard'
import CustomerDashboard from './Components/Pages/CustomerDashboard'
import BookingForm from './Components/Pages/BookingForm'
import Contact from './Components/Pages/Contact'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/login"               element={<Login />} />
        <Route path="/Register"            element={<Register />} />
        <Route path="/register/customer"   element={<CustomerRegister />} />
        <Route path="/register/worker"     element={<WorkerRegister />} />
        <Route path="/Services"            element={<Services />} />
        <Route path="/admin/dashboard"     element={<AdminDashboard />} />
        <Route path="/worker/dashboard"    element={<WorkerDashboard />} />
        <Route path="/customer/dashboard"  element={<CustomerDashboard />} />
        <Route path="/booking/:service" element={<BookingForm />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App