// SignUp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseinit';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import styled from 'styled-components';

// 스타일 컴포넌트 정의
const SignUpContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh; /* 화면 전체 높이 */
    background-color: #f0f4f8; /* 배경색 */
`;

const SignUpForm = styled.form`
    background: white;
    padding: 30px; /* 패딩 증가 */
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2); /* 그림자 효과 */
    width: 350px; /* 폼 너비 */
    text-align: center; /* 텍스트 중앙 정렬 */
`;

const Input = styled.input`
    width: 100%;
    padding: 12px; /* 패딩 증가 */
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 16px;
    transition: border-color 0.3s;

    &:focus {
        border-color: #1976d2; /* 포커스 시 테두리 색상 변경 */
        outline: none; /* 기본 아웃라인 제거 */
    }
`;

const Button = styled.button`
    width: 100%;
    padding: 12px;
    font-size: 16px;

`;

function SignUp() {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setUser(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handlePasswordValidation = () => {
        if (user.password !== user.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return false;
        }
        return true;
    };

    const handleSignUp = async () => {
        //회원가입 및 해당 정보 db에 저장 
        if (!handlePasswordValidation()) return;
        try {
             // auth로 회원가입 시도
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                user.email,
                user.password,
            );
            console.log('회원가입 성공:', userCredential.user);

            // 사용자 프로필 업데이트 (이름 넣기)
            await updateProfile(userCredential.user, {
                displayName: user.username
            });
           
            // Firestore에 사용자 데이터 저장
            await setDoc(doc(db, "users", userCredential.user.uid), {
                username: user.username,
                email: user.email,
                createdAt: new Date(),
            });
            console.log('사용자 데이터가 성공적으로 저장되었습니다.');
            alert('회원가입 성공!');
            navigate('/');
        } catch (error) {
            console.error('회원가입 실패:', error.message);
            alert('회원가입에 실패했습니다. ' + error.message);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        handleSignUp();
    };

    return (
        <SignUpContainer>
            <SignUpForm onSubmit={handleSubmit}>
                <h2>Sign Up</h2>
                <div>
                    <label htmlFor="email">Email:</label>
                    <Input
                        type="email"
                        id="email"
                        value={user.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="username">사용자 이름:</label>
                    <Input
                        type="text"
                        id="username"
                        value={user.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <Input
                        type="password"
                        id="password"
                        value={user.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirmPassword">비밀번호 확인:</label>
                    <Input
                        type="password"
                        id="confirmPassword"
                        value={user.confirmPassword}
                        onChange={handleChange}
                        onBlur={handlePasswordValidation}
                        required
                    />
                </div>
                <Button type="submit">Sign Up</Button>
            </SignUpForm>
        </SignUpContainer>
    );
}

export default SignUp;