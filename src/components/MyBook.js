// MyBook.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Heading from './Heading';
import Book from './Book';
import { auth, db } from '../firebaseinit';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const MyBookContainer = styled.div`
    padding: 30px;
    max-width: 1200px;
    margin: 0 auto;
    background-color: #f9f9f9;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const PageTitle = styled.h2`
    font-size: 28px;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #4a90e2;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const FilterContainer = styled.div`
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
`;

const BookGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 25px;
    margin-top: 30px;
`;

const BookCard = styled.div`
    position: relative;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }
`;

const BookCover = styled.img`
    width: 100%;
    height: 280px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 15px;
    box-shadow: 0 3px 6px rgba(0,0,0,0.1);
`;

const BookTitle = styled.h3`
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #333;
    font-weight: 600;
    line-height: 1.4;
    height: 50px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const BookAuthor = styled.p`
    margin: 0;
    font-size: 15px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ReadingStatus = styled.span`
    display: inline-block;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
    margin-top: 12px;
    background-color: ${props => 
        props.status === '읽는 중' ? '#e3f2fd' : 
        props.status === '완독' ? '#e8f5e9' : '#fff8e1'
    };
    color: ${props => 
        props.status === '읽는 중' ? '#1976d2' : 
        props.status === '완독' ? '#388e3c' : '#ffa000'
    };
`;

const DeleteButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(244, 67, 54, 0.9);
    color: white;
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    opacity: 0;
    transition: opacity 0.2s;
    
    ${BookCard}:hover & {
        opacity: 1;
    }
    
    &:hover {
        background: #f44336;
    }
`;

const FilterButton = styled.button`
    padding: 8px 15px;
    font-size: 14px;
    background: ${props => props.active ? '#4a90e2' : '#f0f0f0'};
    color: ${props => props.active ? 'white' : '#333'};
    border: none;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
        background: ${props => props.active ? '#3a7bc8' : '#e0e0e0'};
        transform: translateY(-2px);
    }
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 60px 20px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    margin-top: 30px;
    
    h3 {
        margin-bottom: 15px;
        color: #333;
        font-size: 24px;
    }
    
    p {
        margin-bottom: 25px;
        color: #666;
        font-size: 16px;
    }
    
    svg {
        margin-bottom: 20px;
        color: #4a90e2;
    }
`;

const LoadingContainer = styled.div`
    text-align: center;
    padding: 50px;
    color: #666;
    font-size: 18px;
`;

function MyBook() {
    const [myBooks, setMyBooks] = useState([]);
    const [selectedBook, setSelectedBook] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filter, setFilter] = useState('전체');
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();
    const { uid } = useParams();

    // 선택한 책의 내용 변경 시 해당 내용 myBooks에 갱신
    useEffect(() => {
        if (selectedBook) {
            setMyBooks(prevBooks => 
                prevBooks.map(book => 
                    book.id === selectedBook.id ? selectedBook : book
                )
            );
        }
    }, [selectedBook]);

    // 기존 USER에 책 정보를 myBooks에 저장
    useEffect(() => {
        const fetchBooksFromFirebase = async () => {
            try {
                setLoading(true);
                
                if (!auth.currentUser) {
                    console.log('로그인이 필요합니다.');
                    navigate('/');
                    return;
                }

                // URL의 uid와 현재 로그인한 사용자의 uid 비교
                if (uid !== auth.currentUser.uid) {
                    console.log('접근 권한이 없습니다.');
                    navigate(`/mybook/${auth.currentUser.uid}`);
                    return;
                }

                const docRef = doc(db, "users", uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMyBooks(data.books || []);
                    console.log('책 데이터가 성공적으로 불러와졌습니다.');
                } else {
                    // 사용자 문서가 없으면 빈 배열로 초기화
                    await setDoc(docRef, { books: [] });
                    console.log('새로운 사용자 문서가 생성되었습니다.');
                }
            } catch (error) {
                console.error('책 데이터 불러오기 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooksFromFirebase();
    }, [navigate, uid]);

    // 책 추가 시 DB에 저장
    useEffect(() => {
        const saveToFirebase = async () => {
            try {
                if (!auth.currentUser) return;
                
                const uid = auth.currentUser.uid;
                
                if (uid && myBooks.length >= 0) {
                    await updateDoc(doc(db, "users", uid), {
                        books: myBooks
                    });
                    console.log('책 데이터가 성공적으로 저장되었습니다.');
                }
            } catch (error) {
                console.error('책 데이터 저장 실패:', error);
            }
        };

        // myBooks가 변경되었을 때만 실행
        if (!loading) {
            saveToFirebase();
        }
    }, [myBooks, loading]);
  
    const handleDeleteBook = async (bookId) => {
        try {
            const updatedBooks = myBooks.filter(book => book.id !== bookId);
            setMyBooks(updatedBooks);
            
            // Firestore에 바로 업데이트 (선택 사항)
            if (auth.currentUser) {
                const uid = auth.currentUser.uid;
                await updateDoc(doc(db, "users", uid), {
                    books: updatedBooks
                });
            }
        } catch (error) {
            console.error('책 삭제 중 오류 발생:', error);
            alert('책 삭제 중 오류가 발생했습니다.');
        }
    };

    const filteredBooks = myBooks.filter(book => 
        filter === '전체' || book.status === filter
    );

    return (
        <>
            <Heading myBooks={myBooks} setMyBooks={setMyBooks}/>
            <MyBookContainer>
                <PageTitle>
                    내 서재
                    <FilterContainer>
                        <FilterButton 
                            active={filter === '전체'} 
                            onClick={() => setFilter('전체')}
                        >
                            전체
                        </FilterButton>
                        <FilterButton 
                            active={filter === '읽을 예정'} 
                            onClick={() => setFilter('읽을 예정')}
                        >
                            읽을 예정
                        </FilterButton>
                        <FilterButton 
                            active={filter === '읽는 중'} 
                            onClick={() => setFilter('읽는 중')}
                        >
                            읽는 중
                        </FilterButton>
                        <FilterButton 
                            active={filter === '완독'} 
                            onClick={() => setFilter('완독')}
                        >
                            완독
                        </FilterButton>
                    </FilterContainer>
                </PageTitle>
                
                {loading ? (
                    <LoadingContainer>
                        <p>서재 정보를 불러오는 중입니다...</p>
                    </LoadingContainer>
                ) : myBooks.length === 0 ? (
                    <EmptyState>
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 2L6 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M10 7H18V19H10V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M13 4H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <h3>아직 서재에 책이 없습니다</h3>
                        <p>상단 검색창을 통해 책을 검색하고 내 서재에 추가해보세요!</p>
                    </EmptyState>
                ) : (
                    <BookGrid>
                        {filteredBooks.map(book => (
                            <BookCard 
                                key={book.id} 
                                onClick={() => {
                                    setSelectedBook(book);
                                    setIsModalOpen(true);
                                }}
                            >
                                <DeleteButton onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('정말로 이 책을 서재에서 삭제하시겠습니까?')) {
                                        handleDeleteBook(book.id);
                                    }
                                }}>
                                    ✕
                                </DeleteButton>
                                <BookCover 
                                    src={book.cover} 
                                    alt={book.title}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/220x280?text=No+Image';
                                    }}
                                />
                                <BookTitle>{book.title}</BookTitle>
                                <BookAuthor>{book.author}</BookAuthor>
                                <ReadingStatus status={book.status}>{book.status}</ReadingStatus>
                            </BookCard>
                        ))}
                    </BookGrid>
                )}
                
                {isModalOpen && selectedBook && (
                    <Book
                        book={selectedBook}
                        setBook={setSelectedBook}
                        setMyBooks={setMyBooks}
                        myBooks={myBooks}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </MyBookContainer>
        </>
    );
}

export default MyBook;