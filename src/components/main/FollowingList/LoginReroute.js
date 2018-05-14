import React from 'react'
import { Link } from 'react-router-dom'

const LoginReroute = () => {
  return (
    <div className="following-reroute-container fade-in-element">
      <p className="following-reroute-title">Login to see your list!</p>
      <div>
        <Link href="/auth/login" to="/auth/login">Login</Link>
        <p>|</p>
        <Link href="/auth/signup" to="/auth/signup">Signup</Link>
      </div>
    </div>
  )
}

export default LoginReroute
