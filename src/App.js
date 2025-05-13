import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// 컴포넌트 가져오기
import DashBoard from './components/DashBoard';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Search from './components/Search';
import Book from './components/Book';
import MyBook from './components/MyBook';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard/:uid" element={<DashBoard />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/search" element={<Search />} />
          <Route path="/book/:id" element={<Book />} />
          <Route path="/mybook/:uid" element={<MyBook />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
