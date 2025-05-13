//DashBoard.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Heading from './Heading';
import Recommend from './Recommend';
import Overview from './Overview';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseinit';
import { Link } from 'react-router-dom';

const DashboardContainer = styled.div`
    padding: 20px;
    max-width: 1000px;
    width: 100%;
    margin: 0 auto;
    background-color: #f5f5f5;
    border-radius: 8px;
    overflow-x: hidden;
    
    @media (max-width: 1024px) {
        padding: 15px;
        width: 95%;
    }
    
    @media (max-width: 600px) {
        padding: 10px;
        width: 92%;
    }
`;

const DashboardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-top: 20px;
    
    @media (max-width: 600px) {
        grid-template-columns: 1fr;
        gap: 15px;
    }
`;

const DashboardCard = styled.div`
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-bottom: 20px;
    
    h3 {
        font-size: clamp(16px, 2vw, 20px);
        margin-bottom: 15px;
    }
    
    p {
        font-size: clamp(11px, 1.2vw, 14px);
    }
`;

const BookItem = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding: 10px;
    border-bottom: 1px solid #eee;
    &:last-child {
        border-bottom: none;
    }
`;

const BookCover = styled.img`
    width: 50px;
    height: 70px;
    object-fit: cover;
    margin-right: 10px;
`;

const BookInfo = styled.div`
    flex: 1;
`;

const BookTitle = styled.h4`
    margin: 0 0 5px 0;
    font-size: clamp(12px, 1.5vw, 14px);
`;

const BookAuthor = styled.p`
    margin: 0;
    font-size: clamp(10px, 1.2vw, 12px);
    color: #666;
`;

const GroupItem = styled.div`
    padding: 10px;
    border-bottom: 1px solid #eee;
    
    &:last-child {
        border-bottom: none;
    }
    
    h4 {
        font-size: clamp(13px, 1.6vw, 16px);
        margin-bottom: 8px;
    }
    
    p {
        font-size: clamp(11px, 1.2vw, 13px);
        margin: 5px 0;
    }
`;

const ViewAllButton = styled(Link)`
    display: inline-block;
    margin-top: 10px;
    padding: 8px 15px;
    background-color: #4a90e2;
    color: white;
    border-radius: 4px;
    text-decoration: none;
    font-size: clamp(12px, 1.4vw, 14px);
    transition: all 0.2s;
    
    &:hover {
        background-color: #3a7bc8;
        transform: translateY(-2px);
    }
`;

function Dashboard() {
    
    const [books, setBooks] = useState([]);
    
    // db에서 저장되어있는 내 책 목록 가져오기
    useEffect(() => {
        const fetchBooksFromFirebase = async () => {
            try {
                if (!auth.currentUser) {
                    return;
                }

                const uid = auth.currentUser.uid;
                const docRef = doc(db, "users", uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // 모든 책 가져오기 (상태에 상관없이)
                    setBooks(data.books || []);
                }
            } catch (error) {
                console.error('책 데이터 불러오기 실패:', error);
            }
        };

        fetchBooksFromFirebase();
    }, []);


    const readingGroups = [
        { id: 1, name: "프로그래밍 도서 읽기", members: 8, currentBook: "리팩터링" },
        { id: 2, name: "IT 기술 독서모임", members: 12, currentBook: "도메인 주도 설계" }
    ];

    return (
        <>
            <Heading />
            <DashboardContainer>
                <DashboardCard>
                        <h3>내 요약정보</h3>
                        <Overview />
                </DashboardCard>
                <DashboardGrid>
                    <DashboardCard>
                        <h3>내 서재</h3>
                        {books.length > 0 ? (
                            <>
                                {books.slice(0, 5).map(book => (
                                    <BookItem key={book.id}>
                                        <BookCover 
                                            src={book.cover} 
                                            alt={book.title}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/50x70?text=No+Cover';
                                            }}
                                        />
                                        <BookInfo>
                                            <BookTitle>{book.title}</BookTitle>
                                            <BookAuthor>{book.author}</BookAuthor>
                                        </BookInfo>
                                    </BookItem>
                                ))}
                                <ViewAllButton to={`/mybook/${auth.currentUser?.uid}`}>
                                    전체보기
                                </ViewAllButton>
                            </>
                        ) : (
                            <>
                                <p>서재에 책이 없습니다.</p>
                                <ViewAllButton to={`/mybook/${auth.currentUser?.uid}`}>
                                    서재로 이동
                                </ViewAllButton>
                            </>
                        )}
                    </DashboardCard>
                    <DashboardCard>
                        <h3>독서 모임</h3>
                        {readingGroups.map(group => (
                            <GroupItem key={group.id}>
                                <h4>{group.name}</h4>
                                <p>멤버: {group.members}명</p>
                                <p>현재 읽는 책: {group.currentBook}</p>
                            </GroupItem>
                        ))}
                    </DashboardCard>
                </DashboardGrid>

                <DashboardCard>
                        <h3>추천 도서</h3>
                        <Recommend />
                </DashboardCard>

            </DashboardContainer>
        </>
    );
}

export default Dashboard;

