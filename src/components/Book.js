// book.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled.div`
    background-color: white;
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 85vh;
    overflow: auto;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
`;

const BookContent = styled.div`
    display: flex;
    gap: 30px;
    margin-bottom: 30px;
    
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: center;
    }
`;

const BookCover = styled.img`
    width: 200px;
    height: 300px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const BookInfo = styled.div`
    flex: 1;
`;

const BookTitle = styled.h2`
    margin: 0 0 15px 0;
    font-size: 24px;
    color: #333;
    border-bottom: 2px solid #4a90e2;
    padding-bottom: 10px;
`;

const BookDetail = styled.p`
    margin: 8px 0;
    font-size: 16px;
    color: #555;
    
    strong {
        color: #333;
        margin-right: 5px;
    }
`;

const NotesContainer = styled.div`
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 15px;
    max-height: 300px;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 10px;
    }
`;

const NoteEntry = styled.div`
    margin: 15px 0;
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 12px;
    border-left: 4px solid #4a90e2;
`;

const NoteHeader = styled.div`
    font-weight: bold;
    color: #4a90e2;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
`;

const NoteContent = styled.div`
    color: #555;
    line-height: 1.5;
    white-space: pre-wrap;
    word-break: break-word;
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-top: 20px;
    justify-content: center;
    
    @media (max-width: 600px) {
        flex-direction: column;
    }
`;

const Button = styled.button`
    padding: 10px 20px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    background-color: ${props => props.primary ? '#4a90e2' : props.success ? '#4CAF50' : props.danger ? '#f44336' : '#f0f0f0'};
    color: ${props => props.primary || props.success || props.danger ? 'white' : '#333'};
    
    &:hover {
        opacity: 0.9;
        transform: translateY(-2px);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const TextArea = styled.textarea`
    width: 100%;
    height: 120px;
    margin-top: 15px;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 15px;
    resize: vertical;
    min-height: 80px;
    max-height: 300px;
    font-family: inherit;
    
    &:focus {
        border-color: #4a90e2;
        outline: none;
        box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
    }
    
    &::placeholder {
        color: #aaa;
    }
`;

const ReadingStatus = styled.span`
    display: inline-block;
    padding: 5px 10px;
    border-radius: 20px;
    font-weight: bold;
    margin-left: 10px;
    font-size: 14px;
    background-color: ${props => 
        props.status === '읽는 중' ? '#e3f2fd' : 
        props.status === '완독' ? '#e8f5e9' : '#fff8e1'
    };
    color: ${props => 
        props.status === '읽는 중' ? '#1976d2' : 
        props.status === '완독' ? '#388e3c' : '#ffa000'
    };
`;

const CurrentReadingTimer = styled.div`
    background-color: #e3f2fd;
    padding: 10px 15px;
    border-radius: 8px;
    margin-top: 15px;
    text-align: center;
    font-size: 18px;
    font-weight: bold;
    color: #1976d2;
`;

const Modal = ({ show, onClose, children }) => {
    if (!show) return null;
    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={e => e.stopPropagation()}>
                {children}
            </ModalContent>
        </ModalOverlay>
    );
};

const Book = ({ book, onClose, setBook }) => {
    const [isReading, setIsReading] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const [currentReadingTime, setCurrentReadingTime] = useState(0);
    const [note, setNote] = useState('');

    useEffect(() => {
        let timer;
        if (isReading) {
            timer = setInterval(() => {
                setCurrentReadingTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isReading]);

    const handleStartReading = () => {
        setIsReading(true);
        setStartTime(new Date());
        setBook({
            ...book,
            status: '읽는 중',
            startDate: new Date().toISOString().split('T')[0],
            readCount: book.readCount + 1
        });
    };

    const handleStopReading = () => {
        setIsReading(false);
        const endTime = new Date();
        const readingTime = Math.round((endTime - startTime) / 1000); // 초 단위로 계산
        setBook(prevBook => ({
            ...prevBook,
            totalReadingTime: (prevBook.totalReadingTime || 0) + readingTime
        }));
        setCurrentReadingTime(0); // 현재 읽기 시간을 초기화
    };

    const handleCompleteReading = () => {
        if (isReading) {
            handleStopReading();
        }
        setBook({
            ...book,
            status: '완독',
            endDate: new Date().toISOString().split('T')[0]
        });
    };

    const handleSaveNote = () => {
        if (!note.trim()) {
            alert('메모 내용을 입력해주세요');
            return;
        }
        
        const currentDate = new Date().toISOString().split('T')[0];
        const newSummaryEntry = `#${book.readCount}+${currentDate}+${note}`;
        setBook(prevBook => ({
            ...prevBook,
            summary: prevBook.summary ? `${prevBook.summary}\n${newSummaryEntry}` : newSummaryEntry
        }));
        setNote(''); // 메모 입력란 초기화
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        let formattedTime = '';
        if (hours > 0) formattedTime += `${hours}시간 `;
        if (minutes > 0 || hours > 0) formattedTime += `${minutes}분 `;
        formattedTime += `${secs}초`;
        
        return formattedTime;
    };

    // 독서 메모 내용 분석
    const renderNotes = () => {
        if (!book.summary) return <p>아직 독서 메모가 없습니다.</p>;
        
        return book.summary.split('\n').map((entry, index) => {
            const parts = entry.split('+');
            if (parts.length !== 3) return null;
            
            const [readCount, date, content] = parts;
            return (
                <NoteEntry key={index}>
                    <NoteHeader>
                        <span>{readCount.replace('#', '')}차 독서</span>
                        <span>{date}</span>
                    </NoteHeader>
                    <NoteContent>{content}</NoteContent>
                </NoteEntry>
            );
        });
    };

    return (
        <Modal show={true} onClose={onClose}>
            <BookContent>
                <BookCover 
                    src={book.cover} 
                    alt={book.title}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/200x300?text=No+Image';
                    }}
                />
                <BookInfo>
                    <BookTitle>
                        {book.title}
                        <ReadingStatus status={book.status}>
                            {book.status}
                        </ReadingStatus>
                    </BookTitle>
                    <BookDetail><strong>저자:</strong> {book.author}</BookDetail>
                    <BookDetail><strong>출판사:</strong> {book.publisher || '정보 없음'}</BookDetail>
                    <BookDetail><strong>출판일:</strong> {book.pubDate || '정보 없음'}</BookDetail>
                    <BookDetail><strong>총 독서시간:</strong> {formatTime(book.totalReadingTime || 0)}</BookDetail>
                    <BookDetail><strong>읽은 횟수:</strong> {book.readCount || 0}회</BookDetail>
                    
                    {isReading && (
                        <CurrentReadingTimer>
                            현재 독서 시간: {formatTime(currentReadingTime)}
                        </CurrentReadingTimer>
                    )}
                    
                    {book.startDate && <BookDetail><strong>시작일:</strong> {book.startDate}</BookDetail>}
                    {book.endDate && <BookDetail><strong>완료일:</strong> {book.endDate}</BookDetail>}
                    
                    <BookDetail><strong>독서 메모:</strong></BookDetail>
                    <NotesContainer>
                        {renderNotes()}
                    </NotesContainer>
                </BookInfo>
            </BookContent>
            
            {isReading && (
                <>
                    <h3>{book.readCount}차 독서 메모</h3>
                    <TextArea 
                        value={note} 
                        onChange={(e) => setNote(e.target.value)} 
                        placeholder="오늘 읽은 내용을 메모하세요..."
                    />
                    <ButtonGroup>
                        <Button primary onClick={handleSaveNote}>메모 저장</Button>
                        <Button danger onClick={handleStopReading}>독서 종료</Button>
                    </ButtonGroup>
                </>
            )}
            
            <ButtonGroup>
                {!isReading && (
                    <Button primary onClick={handleStartReading}>독서 시작</Button>
                )}
                <Button success onClick={handleCompleteReading}>독서 완료</Button>
                <Button onClick={onClose}>닫기</Button>
            </ButtonGroup>
        </Modal>
    );
};

export default Book;