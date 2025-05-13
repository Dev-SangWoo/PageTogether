// Login.js

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebaseinit';
import { signInWithEmailAndPassword } from 'firebase/auth';
import styled from 'styled-components';


const LoginContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f0f4f8;
`;

const LoginForm = styled.form`
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    width: 300px;
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
`;

const Button = styled.button`
    width: 100%;
    padding: 10px;
    font-size: 16px;
`;
const SignUpLink = styled(Link)`
    margin-top: 10px;
    text-decoration: none;
    color: #1976d2;
    &:hover {
        text-decoration: underline;
    }
`;

const Login = ()=> {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('로그인 성공:', auth.currentUser.uid);
      const uid = auth.currentUser.uid;
      navigate(`/dashboard/${uid}`); 
    } catch (error) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      console.error(error);
    }
  };

    return (
        
        <LoginContainer>
            <h1>Page Together</h1>
           <p>
            함께 읽고 함께 나누는 독서 커뮤니티
           </p>
            
            <LoginForm onSubmit={handleLogin}>
                <h2>로그인</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <Input 
                    type="text" 
                    placeholder="Email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <Button type="submit">로그인</Button>
                <SignUpLink to="/signup">회원가입</SignUpLink>
            </LoginForm>
        </LoginContainer>
    );
}

export default Login;

