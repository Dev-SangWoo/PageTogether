import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { auth, db } from '../firebaseinit';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';

// 스타일 컴포넌트 정의
const RecommendContainer = styled.div`
    margin-top: 20px;
    padding: 15px;
    
    @media (max-width: 600px) {
        padding: 10px;
    }
`;

const RecommendTitle = styled.h3`
    margin-bottom: 20px;
    color: #333;
    font-size: clamp(16px, 2vw, 18px);
`;

const BookList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 15px;
`;

const BookItem = styled.div`
    display: flex;
    width: 100%;
    max-width: 100%;
    padding: 15px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: all 0.2s;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    
    @media (max-width: 480px) {
        padding: 10px;
    }
    
    &:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    
    &:active {
        transform: translateY(-2px);
        box-shadow: 0 3px 10px rgba(0,0,0,0.1);
    }
`;

const BookCover = styled.img`
    width: 70px;
    height: 100px;
    object-fit: cover;
    margin-right: 15px;
    border-radius: 4px;
    
    @media (max-width: 480px) {
        width: 60px;
        height: 90px;
        margin-right: 10px;
    }
`;

const BookInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const BookTitle = styled.h4`
    margin: 0 0 5px 0;
    color: #333;
    font-size: clamp(14px, 1.6vw, 16px);
`;

const BookAuthor = styled.p`
    margin: 0 0 5px 0;
    color: #666;
    font-size: clamp(12px, 1.4vw, 14px);
`;

const BookPublisher = styled.p`
    margin: 0 0 5px 0;
    color: #888;
    font-size: clamp(12px, 1.4vw, 14px);
`;

const BookDescription = styled.p`
    margin: 5px 0 0 0;
    color: #555;
    font-size: clamp(12px, 1.3vw, 14px);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
`;

const LoadingText = styled.div`
    padding: 20px;
    text-align: center;
    color: #666;
    font-size: clamp(14px, 1.6vw, 16px);
`;

const ErrorText = styled.div`
    padding: 20px;
    text-align: center;
    color: #d32f2f;
    font-size: clamp(14px, 1.6vw, 16px);
`;

const Button = styled.button`
    padding: 10px 15px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: clamp(12px, 1.4vw, 14px);
    cursor: pointer;
    margin-top: 15px;
    
    &:hover {
        background-color: #3a7bc8;
    }
`;

const AddButton = styled.button`
    position: absolute;
    top: 15px;
    right: 15px;
    padding: 5px 10px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: clamp(10px, 1.2vw, 12px);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
    
    ${BookItem}:hover & {
        opacity: 1;
    }
    
    &:hover {
        background-color: #45a049;
    }
`;

const Notification = styled.div`
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 15px 20px;
    background-color: ${props => props.success ? '#4CAF50' : '#f44336'};
    color: white;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    z-index: 1000;
    animation: slideIn 0.3s, fadeOut 0.5s 2.5s forwards;
    font-size: clamp(12px, 1.4vw, 14px);
    
    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;

// 테스트용 더미 데이터 (API 호출 실패 시 사용)
const dummyBooks = [
    {
        title: "클린 코드",
        author: "로버트 C. 마틴",
        publisher: "인사이트",
        cover: "https://image.aladin.co.kr/product/3/27/cover500/8966260959_1.jpg",
        description: "프로그래머가 반드시 알아야 할 객체 지향 프로그래밍과 디자인 패턴의 핵심"
    },
    {
        title: "사피엔스",
        author: "유발 하라리",
        publisher: "김영사",
        cover: "https://image.aladin.co.kr/product/5464/75/cover500/8934972467_1.jpg",
        description: "유인원에서 사이보그까지, 인간 역사의 대담하고 위대한 질문"
    },
    {
        title: "돈의 심리학",
        author: "모건 하우절",
        publisher: "인플루엔셜",
        cover: "https://image.aladin.co.kr/product/29196/63/cover500/k112835968_1.jpg",
        description: "행동 경제학과 심리학으로 통찰하는 부자의 사고방식"
    }
];

const Recommend = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', success: true });

    useEffect(() => {
        // 컴포넌트 마운트 시 랜덤 책 검색
        fetchRandomBooks();
    }, []);

    // 추천 도서를 내 서재에 추가하는 함수
    const addBookToLibrary = async (book, event) => {
        // 이벤트 전파 방지 (책 항목 클릭 이벤트와 겹치지 않도록)
        if (event) {
            event.stopPropagation();
        }
        
        try {
            // 로그인 여부 확인
            if (!auth.currentUser) {
                showNotification('로그인이 필요한 기능입니다.', false);
                return;
            }

            const uid = auth.currentUser.uid;
            const userRef = doc(db, "users", uid);
            const userDoc = await getDoc(userRef);

            // 사용자 문서가 존재하지 않으면 생성
            if (!userDoc.exists()) {
                await setDoc(userRef, { books: [] });
            }

            // 현재 사용자의 책 목록 가져오기
            const userData = userDoc.exists() ? userDoc.data() : { books: [] };
            
            // 이미 추가된 책인지 확인
            const isBookAlreadyAdded = userData.books && 
                userData.books.some(b => 
                    b.title === book.title && b.author === book.author
                );
            
            if (isBookAlreadyAdded) {
                showNotification('이미 내 서재에 추가된 책입니다.', false);
                return;
            }

            // 새 책 정보 구성
            const newBook = {
                id: Date.now().toString(),
                title: book.title,
                author: book.author,
                cover: book.cover,
                publisher: book.publisher,
                status: "읽을 예정",
                totalReadingTime: 0,
                readCount: 0,
                startDate: null,
                endDate: null,
                addedAt: new Date().toISOString()
            };

            // Firestore에 책 정보 추가
            await updateDoc(userRef, {
                books: arrayUnion(newBook)
            });

            showNotification('내 서재에 책이 추가되었습니다!', true);
        } catch (error) {
            console.error('책 추가 중 오류 발생:', error);
            showNotification('책 추가 중 오류가 발생했습니다: ' + error.message, false);
        }
    };
    
    // 알림 표시 함수
    const showNotification = (message, success = true) => {
        setNotification({ show: true, message, success });
        
        // 3초 후 알림 숨기기
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    // 책 항목 클릭 처리 함수
    const handleBookClick = (book) => {
        addBookToLibrary(book);
    };

    const fetchRandomBooks = async () => {
        setLoading(true);
        setError(null);

        // 바로 더미 데이터 표시 (API 요청 시도 전)
        // 이렇게 하면 사용자는 즉시 콘텐츠를 볼 수 있음
        setBooks(dummyBooks);
        
        try {
            // 알라딘 API 키 (환경 변수에서 가져옴)
            const TTB_KEY = process.env.REACT_APP_ALADIN_API_KEY;
            
            // API 키가 없는 경우 더미 데이터만 사용
            if (!TTB_KEY) {
                console.warn('알라딘 API 키가 설정되지 않았습니다. 더미 데이터를 사용합니다.');
                return;
            }
            
            // 다양한 검색 옵션과 카테고리
            const queryOptions = [
                // 베스트셀러
                { type: 'Bestseller', query: '', categoryId: 0 },
                // 신간 전체
                { type: 'ItemNewAll', query: '', categoryId: 0 },
                // 인기 카테고리 - 소설
                { type: 'Keyword', query: '소설', categoryId: 50920 },
                // 인기 카테고리 - 경제경영
                { type: 'Keyword', query: '경제', categoryId: 170 },
                // 인기 카테고리 - 자기계발
                { type: 'Keyword', query: '자기계발', categoryId: 336 }
            ];
            
            // 랜덤으로 옵션 선택
            const randomOption = queryOptions[Math.floor(Math.random() * queryOptions.length)];
            console.log('선택된 검색 옵션:', randomOption);
            
            // 여러 프록시 서버 URL 목록 (순서대로 시도)
            const proxyUrls = [
                'https://corsproxy.io/?',
                'https://api.allorigins.win/raw?url=',
                'https://cors-anywhere.herokuapp.com/'
            ];
            
            const apiUrl = 'http://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
            
            // API 요청 파라미터
            const params = {
                TTBKey: TTB_KEY,
                Query: randomOption.query,
                QueryType: randomOption.type,
                MaxResults: 5,
                start: 1,
                SearchTarget: 'Book',
                output: 'js',
                Version: '20131101'
            };
            
            // 카테고리 ID가 있으면 추가
            if (randomOption.categoryId > 0) {
                params.CategoryId = randomOption.categoryId;
            }
            
            // URL 쿼리 파라미터 생성
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
            
            // 각 프록시 서버 순차적으로 시도
            let success = false;
            let responseData = null;
            
            for (const proxyUrl of proxyUrls) {
                if (success) break;
                
                try {
                    console.log(`프록시 서버 시도: ${proxyUrl}`);
                    
                    // 프록시를 통한 API 요청
                    const fullUrl = proxyUrl.includes('allorigins') 
                        ? `${proxyUrl}${encodeURIComponent(`${apiUrl}?${queryString}`)}`
                        : `${proxyUrl}${apiUrl}?${queryString}`;
                    
                    const response = await axios({
                        method: 'get',
                        url: fullUrl,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        timeout: 10000 // 10초로 타임아웃 증가
                    });
                    
                    if (response.status === 200) {
                        responseData = response.data;
                        success = true;
                        console.log('프록시 서버 응답 성공:', proxyUrl);
                    }
                } catch (proxyError) {
                    console.warn(`프록시 서버 실패 (${proxyUrl}):`, proxyError.message);
                    // 다음 프록시 서버 시도
                    continue;
                }
            }
            
            // 모든 프록시 서버 시도 후 성공했으면 데이터 처리
            if (success && responseData) {
                // 응답 데이터 타입 확인 및 처리
                if (typeof responseData === 'string') {
                    // 문자열 응답인 경우 파싱 시도
                    try {
                        // 우선 JS 형식의 응답에서 객체 부분 추출 시도
                        const match = responseData.match(/var\s+[a-zA-Z0-9_$]+\s*=\s*(\{.*\});/s);
                        
                        if (match && match[1]) {
                            // JS 객체 문자열을 JSON으로 변환
                            const jsonStr = match[1]
                                .replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":')
                                .replace(/'([^']*)'/g, '"$1"');
                            
                            try {
                                const data = JSON.parse(jsonStr);
                                
                                if (data && data.item && data.item.length > 0) {
                                    // API 응답 데이터 변환 및 상태 업데이트
                                    const formattedBooks = data.item.map(book => ({
                                        title: book.title || '제목 없음',
                                        author: book.author || '저자 미상',
                                        publisher: book.publisher || '출판사 정보 없음',
                                        cover: book.cover || 'https://via.placeholder.com/80x120?text=No+Cover',
                                        description: book.description || '설명이 없습니다.'
                                    }));
                                    setBooks(formattedBooks);
                                    setError(null);
                                }
                            } catch (parseErr) {
                                console.error('JSON 파싱 오류:', parseErr);
                            }
                        }
                    } catch (err) {
                        console.error('응답 데이터 파싱 오류:', err);
                    }
                } else if (typeof responseData === 'object') {
                    // 객체인 경우 직접 사용
                    if (responseData.item && responseData.item.length > 0) {
                        const formattedBooks = responseData.item.map(book => ({
                            title: book.title || '제목 없음',
                            author: book.author || '저자 미상',
                            publisher: book.publisher || '출판사 정보 없음',
                            cover: book.cover || 'https://via.placeholder.com/80x120?text=No+Cover',
                            description: book.description || '설명이 없습니다.'
                        }));
                        setBooks(formattedBooks);
                        setError(null);
                    }
                }
            } else {
                // 모든 프록시 서버 시도 실패
                console.warn('모든 프록시 서버 요청이 실패했습니다. 더미 데이터를 사용합니다.');
                // 이미 더미 데이터가 표시되어 있으므로 추가 작업 불필요
            }
        } catch (err) {
            console.error('책 정보 검색 오류:', err);
            // 이미 더미 데이터가 표시되어 있으므로 추가 작업 불필요
        } finally {
            setLoading(false);
        }
    };

    const retrySearch = () => {
        fetchRandomBooks();
    };

    return (
        <RecommendContainer>
            <RecommendTitle>오늘의 추천 도서</RecommendTitle>
            
            {loading ? (
                <LoadingText>도서 정보를 가져오는 중...</LoadingText>
            ) : error ? (
                <>
                    <ErrorText>{error}</ErrorText>
                    <Button onClick={retrySearch}>다시 시도</Button>
                </>
            ) : (
                <BookList>
                    {books.map((book, index) => (
                        <BookItem 
                            key={index} 
                            onClick={() => handleBookClick(book)}
                        >
                            <BookCover 
                                src={book.cover} 
                                alt={book.title}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/80x120?text=No+Cover';
                                }}
                            />
                            <BookInfo>
                                <BookTitle>{book.title}</BookTitle>
                                <BookAuthor>저자: {book.author}</BookAuthor>
                                <BookPublisher>출판사: {book.publisher}</BookPublisher>
                                <BookDescription>{book.description}</BookDescription>
                            </BookInfo>
                            <AddButton onClick={(e) => addBookToLibrary(book, e)}>
                                내 서재에 추가
                            </AddButton>
                        </BookItem>
                    ))}
                </BookList>
            )}
            
            <Button onClick={retrySearch} style={{ marginTop: '20px', display: 'block', margin: '20px auto 0' }}>
                다른 추천 도서 보기
            </Button>
            
            {notification.show && (
                <Notification success={notification.success}>
                    {notification.message}
                </Notification>
            )}
        </RecommendContainer>
    );
};

export default Recommend;