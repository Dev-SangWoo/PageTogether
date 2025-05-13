import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {  doc, getDoc } from 'firebase/firestore';
import { auth,db } from '../firebaseinit';

const OverviewContainer = styled.div`
    max-width: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 25px;
    margin: 0 auto;
    overflow-x: hidden;
    
    @media (max-width: 768px) {
        gap: 20px;
    }
    
    @media (max-width: 600px) {
        flex-direction: column;
        gap: 15px;
        width: 90%;
    }
`;

const Summary = styled.div`
    flex: 1;
    max-width: 180px;
    background: #e3f2fd;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    
    @media (max-width: 768px) {
        max-width: 160px;
    }
    
    @media (max-width: 600px) {
        max-width: 100%;
    }
`;

const SummaryTitle = styled.h2`
    margin: 0 0 10px 0;
    font-size: clamp(16px, 2vw, 20px);
    color: #1976d2;
    text-align: center;
`;

const SummaryItem = styled.p`
    margin: 0;
    font-size: clamp(12px, 1.5vw, 14px);
    color: #333;
    text-align: center;
`;

const Overview = () => {
    const [totalReadingTime, setTotalReadingTime] = useState(0);
    const [totalBooks, setTotalBooks] = useState(0);
    const [completedBooks, setCompletedBooks] = useState(0); // 완독한 책 수 상태 추가

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
                    const userBooks = data.books || [];
            
                    setTotalReadingTime(userBooks.reduce((acc, book) => acc + (book.readingTime || 0), 0));
                    setTotalBooks(userBooks.length);
                    setCompletedBooks(userBooks.filter(book => book.status === "완독").length); // "완독" 상태인 책 수 계산
                }
            } catch (error) {
                console.error('책 데이터 불러오기 실패:', error);
            }
        };

        fetchBooksFromFirebase();
    }, []);

    return (
        <OverviewContainer>
            <Summary>
                <SummaryTitle>총 독서 시간</SummaryTitle>
                <SummaryItem>{Math.floor(totalReadingTime / 60)}시간 {totalReadingTime % 60}분</SummaryItem>
            </Summary>
            <Summary>
                <SummaryTitle>총 독서 권수</SummaryTitle>
                <SummaryItem>{totalBooks}권</SummaryItem>
            </Summary>
            <Summary>
                <SummaryTitle>완독한 책 수</SummaryTitle>
                <SummaryItem>{completedBooks}권</SummaryItem> {/* 완독한 책 수 표시 */}
            </Summary>
        </OverviewContainer>
    );
}

export default Overview;