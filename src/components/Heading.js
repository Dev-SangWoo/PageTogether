//Heading.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Search from './Search';
import { auth } from '../firebaseinit';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../redux/userSlice';

const HeaderContainer = styled.header`
    width: 100%;
    height: auto;
    min-height: 80px;
    background-color: #4a90e2;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 30px;
    color: white;
    position: sticky;
    top: 0;
    z-index: 100;
    
    @media (max-width: 768px) {
        flex-direction: column;
        padding: 15px;
        gap: 10px;
    }
`;

const Logo = styled.div`
    font-size: clamp(20px, 3vw, 26px);
    font-weight: bold;
    display: flex;
    align-items: center;
    
    @media (max-width: 768px) {
        margin-bottom: 10px;
    }
`;

const LogoLink = styled(Link)`
    text-decoration: none;
    color: white;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    
    &:hover {
        color: #f0f0f0;
        transform: scale(1.05);
    }
    
    svg {
        margin-right: 10px;
        width: clamp(24px, 2.5vw, 30px);
        height: clamp(24px, 2.5vw, 30px);
    }
`;

const Nav = styled.nav`
    display: flex;
    gap: clamp(10px, 2vw, 25px);
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    
    @media (max-width: 480px) {
        gap: 8px;
    }
`;

const StyledLink = styled(Link)`
    text-decoration: none;
    color: white;
    font-weight: 600;
    font-size: clamp(14px, 1.6vw, 16px);
    padding: 8px 12px;
    border-radius: 6px;
    transition: all 0.2s;
    
    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
    }
    
    &.active {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;

const LogoutButton = styled.button`
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 15px;
    font-weight: 600;
    font-size: clamp(14px, 1.6vw, 16px);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-2px);
    }
`;

const WelcomeText = styled.span`
    margin-left: 15px;
    font-size: clamp(12px, 1.4vw, 16px);
    color: rgba(255, 255, 255, 0.9);
    background-color: rgba(255, 255, 255, 0.1);
    padding: 5px 10px;
    border-radius: 20px;
    
    @media (max-width: 480px) {
        margin-left: 8px;
        padding: 4px 8px;
    }
`;

const SearchWrapper = styled.div`
    flex: 1;
    max-width: 500px;
    margin: 0 20px;
    
    @media (max-width: 768px) {
        width: 100%;
        max-width: 100%;
        margin: 10px 0;
    }
`;

function Heading({myBooks, setMyBooks}) {
    const dispatch = useDispatch();
    const displayName = useSelector((state) => state.user.displayName);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await auth.signOut();
            dispatch(clearUser());
            navigate('/');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    // 현재 페이지 URL 경로 확인
    const currentPath = window.location.pathname;
    const isActive = (path) => {
        if (!auth.currentUser) return false;
        const uid = auth.currentUser.uid;
        return currentPath.includes(path) && currentPath.includes(uid);
    };

    return (
        <HeaderContainer>
            <Logo>
                <LogoLink to={`/dashboard/${auth.currentUser?.uid}`}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Page Together
                </LogoLink>
                {displayName && (
                    <WelcomeText>{displayName}님</WelcomeText>
                )}
            </Logo>
            
            <SearchWrapper>
                <Search myBooks={myBooks} setMyBooks={setMyBooks}/>
            </SearchWrapper>
            
            <Nav>
                <StyledLink 
                    to={`/dashboard/${auth.currentUser?.uid}`}
                    className={isActive('/dashboard') ? 'active' : ''}
                >
                    대시보드
                </StyledLink>
                <StyledLink 
                    to={`/mybook/${auth.currentUser?.uid}`}
                    className={isActive('/mybook') ? 'active' : ''}
                >
                    내 서재
                </StyledLink>
                <StyledLink 
                    to={`/mymeeting/${auth.currentUser?.uid}`}
                    className={isActive('/mymeeting') ? 'active' : ''}
                >
                    내 미팅
                </StyledLink>
                <LogoutButton onClick={handleLogout}>
                    로그아웃
                </LogoutButton>
            </Nav>
        </HeaderContainer>
    );
}

export default Heading;
