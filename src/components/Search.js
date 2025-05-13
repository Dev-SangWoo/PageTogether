//Search.js
import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { auth, db } from '../firebaseinit';
import { doc, getDoc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';

// 스타일 컴포넌트 정의
const SearchContainer = styled.div`
    position: relative;
    margin: 20px 0;
    display: flex;
    flex: 1;
    max-width: 400px;
    width: 100%;
    
    @media (max-width: 768px) {
        max-width: 100%;
        margin: 10px 0;
    }
`;

const SearchInput = styled.input`
    flex: 1; /* 남은 공간을 차지하도록 설정 */
    padding: 10px 15px; /* 패딩 추가 */
    border: 1px solid #ccc; /* 테두리 색상 */
    border-radius: 4px 0 0 4px; /* 왼쪽 모서리 둥글게 */
    font-size: clamp(14px, 1.6vw, 16px); /* 반응형 폰트 크기 */
    transition: border-color 0.3s; /* 테두리 색상 변화 애니메이션 */

    &:focus {
        border-color: #1976d2; /* 포커스 시 테두리 색상 변경 */
        outline: none; /* 기본 아웃라인 제거 */
    }
`;

const SearchButton = styled.button`
    padding: 10px 15px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 0 4px 4px 0;
    cursor: pointer;
    transition: background-color 0.3s;
    font-size: clamp(14px, 1.6vw, 16px);
    
    &:hover {
        background-color: #3a7bc8;
    }
    
    &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
`;


const SearchResultsPopup = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    background-color: #fff;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    border-radius: 8px;
    z-index: 1000;
`;

const PopupHeader = styled.div`
    padding: 15px;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f7f7f7;
    border-radius: 8px 8px 0 0;
    
    h3 {
        margin: 0;
        font-size: clamp(16px, 1.8vw, 18px);
    }
    
    button {
        font-size: clamp(14px, 1.6vw, 16px);
    }
`;

const PopupContent = styled.div`
    padding: 15px;
    background-color: #fff;
`;

const ResultItem = styled.div`
    display: flex;
    padding: 15px;
    border-bottom: 1px solid #eee;
    background-color: #fff;
    
    &:hover {
        background-color: #f9f9f9;
    }
    
    &:last-child {
        border-bottom: none;
    }
`;

const ResultImage = styled.img`
    width: 80px;
    height: 120px;
    object-fit: cover;
    margin-right: 15px;
`;

const ResultTitle = styled.h4`
    margin: 0 0 5px 0;
    color: #333333;
    font-size: clamp(14px, 1.6vw, 16px);
    font-weight: bold;
`;

const ResultAuthor = styled.p`
    margin: 0 0 3px 0;
    font-size: clamp(12px, 1.4vw, 14px);
    color: #555555;
`;

const ResultPublisher = styled.p`
    margin: 0 0 3px 0;
    font-size: clamp(12px, 1.4vw, 14px);
    color: #666;
`;

const ResultDescription = styled.p`
    margin: 0;
    font-size: clamp(11px, 1.3vw, 13px);
    color: #888;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

// 테스트용 더미 데이터 - 알라딘 API 연결 실패 시 폴백으로 사용
const dummyBooks = [
    {
        title: "클린 코드",
        author: "로버트 C. 마틴",
        publisher: "인사이트",
        pubDate: "2013-12-24",
        cover: "https://image.aladin.co.kr/product/3/27/cover500/8966260959_1.jpg",
        description: "프로그래머가 반드시 알아야 할 객체 지향 프로그래밍과 디자인 패턴의 핵심"
    },
    {
        title: "리팩터링",
        author: "마틴 파울러",
        publisher: "한빛미디어",
        pubDate: "2012-11-01",
        cover: "https://image.aladin.co.kr/product/490/22/cover500/8979145719_1.jpg",
        description: "코드 품질을 개선하는 객체지향 사고법"
    },
    {
        title: "실용주의 프로그래머",
        author: "앤드류 헌트, 데이비드 토머스",
        publisher: "인사이트",
        pubDate: "2014-03-30",
        cover: "https://image.aladin.co.kr/product/38/33/cover500/8992939949_1.jpg",
        description: "소프트웨어 장인 정신을 더욱 높게 끌어올리는 지혜"
    }
];

const Search = ({myBooks, setMyBooks}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [useDummyData, setUseDummyData] = useState(false);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setError('검색어를 입력해주세요.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 알라딘 API 호출 - CORS 우회 프록시 사용
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const TTB_KEY = process.env.REACT_APP_ALADIN_API_KEY || 'ttbtkddn10120943001'; // 환경 변수에서 API 키 가져오기
            const apiUrl = 'http://www.aladin.co.kr/ttb/api/ItemSearch.aspx';
            
            // API 키 로드 상태 기록
            console.log('알라딘 API 키 환경 변수 사용:', !!process.env.REACT_APP_ALADIN_API_KEY);
            
            const params = {
                TTBKey: TTB_KEY,
                Query: searchTerm,
                QueryType: 'Keyword',
                MaxResults: 10,
                start: 1,
                SearchTarget: 'Book',
                output: 'js',
                Version: '20131101'
            };

            // URL 쿼리 파라미터 생성
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');

            const response = await axios.get(`${proxyUrl}${apiUrl}?${queryString}`);
            
            if (response.data && response.data.item) {
                const books = response.data.item.map(book => ({
                    title: book.title,
                    author: book.author,
                    publisher: book.publisher,
                    pubDate: book.pubDate,
                    cover: book.cover,
                    description: book.description || '설명이 없습니다.'
                }));
                
                setSearchResults(books);
                setUseDummyData(false);
            } else {
                throw new Error('검색 결과가 없습니다.');
            }
        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            
            // API 호출 실패 시 더미 데이터 사용
            setError('알라딘 API 연결에 실패했습니다. 테스트 데이터를 사용합니다.');
            
            // 더미 데이터 필터링
            const filteredResults = dummyBooks.filter(book => 
                book.title.includes(searchTerm) || 
                book.author.includes(searchTerm)
            );
            
            setSearchResults(filteredResults.length > 0 ? filteredResults : dummyBooks);
            setUseDummyData(true);
        } finally {
            setLoading(false);
        }
    };

    const addBookToLibrary = async (book) => {
        try {
            if (!auth.currentUser) {
                alert('로그인이 필요한 기능입니다.');
                return;
            }

            const uid = auth.currentUser.uid;
            const userRef = doc(db, "users", uid);
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                alert('사용자 정보를 찾을 수 없습니다.');
                return;
            }

            const newBook = {
                id: Date.now().toString(),
                title: book.title,
                author: book.author,
                cover: book.cover,
                publisher: book.publisher,
                pubDate: book.pubDate,
                status: "읽을 예정",
                totalReadingTime: 0,
                readCount: 0,
                startDate: null,
                endDate: null,
                addedAt: new Date()
            };

            // Firestore에 책 정보 추가
            await updateDoc(userRef, {
                books: arrayUnion(newBook)
            });

            // 로컬 상태 업데이트 (있을 경우)
            if (setMyBooks) {
                setMyBooks(prevBooks => [...(prevBooks || []), newBook]);
            }

            alert('내 서재에 추가되었습니다!');
        } catch (error) {
            console.error('책 추가 중 오류 발생:', error);
            alert('책 추가 중 오류가 발생했습니다: ' + error.message);
        }
    };

    return (
        <SearchContainer>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', width: '100%' }}>
                <SearchInput
                    type="text"
                    placeholder="검색어를 입력하세요"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <SearchButton type="submit" disabled={loading}>
                    {loading ? '검색 중...' : '검색'}
                </SearchButton>
            </form>
            {error && <p style={{color: 'red'}}>{error}</p>}
            {searchResults.length > 0 && (
                <SearchResultsPopup>
                    <PopupHeader>
                        <h3 style={{margin: 0}}>
                            검색 결과 {useDummyData && '(테스트 데이터)'}
                        </h3>
                        <button onClick={() => setSearchResults([])}
                            style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '20px',
                                color: '#666',
                                padding: '5px 10px',
                                transition: 'color 0.3s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#ff5252'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#666'}
                        >
                            ✕
                        </button>
                    </PopupHeader>
                    <PopupContent>
                        {searchResults.map((result, index) => (
                            <ResultItem key={index}>
                                <ResultImage 
                                    src={result.cover} 
                                    alt={result.title}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/80x120?text=No+Image';
                                    }}
                                />
                                <div>
                                    <ResultTitle>{result.title}</ResultTitle>
                                    <ResultAuthor>{result.author}</ResultAuthor>
                                    <ResultPublisher>
                                        {result.publisher} ({result.pubDate})
                                    </ResultPublisher>
                                    <ResultDescription>
                                        {result.description}
                                    </ResultDescription>
                                    <button 
                                        onClick={() => addBookToLibrary(result)}
                                        style={{
                                            padding: '8px 15px',
                                            backgroundColor: '#4CAF50',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            marginTop: '15px',
                                            fontWeight: 'bold',
                                            transition: 'background-color 0.3s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                                    >
                                        내 서재에 추가
                                    </button>
                                </div>
                            </ResultItem>
                        ))}
                    </PopupContent>
                </SearchResultsPopup>
            )}
        </SearchContainer>
    );
}

export default Search;