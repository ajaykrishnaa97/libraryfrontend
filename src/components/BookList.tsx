import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

interface Book {
    id: number;
    title: string;
    author: string;
    category?: string;
    location?: string;
    status?: string;  // Available / Reserved
    bookCopyId?: number;
}

interface Library {
    id: number;
    name: string;
    location: string;
}

const BookList: React.FC = () => {
    const { isLoggedIn, role } = useContext(AuthContext);
    const [books, setBooks] = useState<Book[]>([]);
    const [category, setCategory] = useState('');
    const [author, setAuthor] = useState('');
    const [location, setLocation] = useState('');
    const [available, setAvailable] = useState('');

    const [coverCache, setCoverCache] = useState<{ [title: string]: string | null }>({});
    const [currentReservedCount, setCurrentReservedCount] = useState(0);

    const [showReserveModal, setShowReserveModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [lendingPeriod, setLendingPeriod] = useState(7);
    const [returnLibraryId, setReturnLibraryId] = useState<number | null>(null);

    const [memberLibraryId, setMemberLibraryId] = useState<number | null>(null);
    const [libraryOptions, setLibraryOptions] = useState<Library[]>([]);

    const fetchBooks = async () => {
        try {
            const params: any = {};
            if (category) params.category = category;
            if (author) params.author = author;
            if (location) params.location = location;
            if (available) params.available = available === 'true';

            const response = await axios.get<Book[]>('http://localhost:5134/books/search', { params });
            setBooks(response.data);

            response.data.forEach((book: Book) => {
                if (!coverCache[book.title]) {
                    fetchBookCover(book.title);
                }
            });
        } catch (error) {
            console.error('Error fetching books:', error);
        }
    };

    const fetchBookCover = async (title: string) => {
        try {
            const response = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(title)}`);
            const items = response.data.items;
            if (items && items.length > 0) {
                const thumbnail = items[0].volumeInfo.imageLinks?.thumbnail;
                if (thumbnail) {
                    setCoverCache(prev => ({ ...prev, [title]: thumbnail }));
                    return;
                }
            }
        } catch (err) {
            console.error(`Error fetching cover for ${title}:`, err);
        }
        setCoverCache(prev => ({ ...prev, [title]: null }));
    };

    const fetchReservedCount = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:5134/books/my-reservations', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const activeReservations = response.data;
            console.log('Fetched active reservations:', activeReservations.length);
            setCurrentReservedCount(activeReservations.length);
        } catch (err) {
            console.error('Error fetching reservations:', err);
        }
    };

    const fetchMemberLibrary = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get('http://localhost:5134/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMemberLibraryId(response.data.libraryId);
        } catch (err) {
            console.error('Failed to fetch member library', err);
        }
    };

    const fetchLibraryOptions = async () => {
        try {
            const response = await axios.get('http://localhost:5134/api/auth/libraries');
            console.log('Fetched libraries:', response.data);
            setLibraryOptions(response.data);

            // 🚨 TEMP fallback: ensure something shows up even if empty
            if (!response.data || response.data.length === 0) {
                console.warn('API returned empty, using fallback libraries.');
                setLibraryOptions([
                    { id: 1, name: 'Central Library', location: 'Main St' },
                    { id: 2, name: 'East Library', location: 'East Side' },
                ]);
            }
        } catch (err) {
            console.error('Failed to fetch libraries', err);
            // 🚨 TEMP fallback if API fails
            setLibraryOptions([
                { id: 1, name: 'Central Library', location: 'Main St' },
                { id: 2, name: 'East Library', location: 'East Side' },
            ]);
        }
    };

    const reserveBook = async (bookCopyId: number, periodDays: number, libraryId: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please login to reserve.');
            return;
        }

        try {
            await axios.post(
                `http://localhost:5134/books/${bookCopyId}/reserve`,
                {
                    returnLibraryId: libraryId,
                    lendingPeriod: periodDays,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert('Book reserved successfully!');
            fetchBooks();
            fetchReservedCount();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data || 'Failed to reserve.');
        }
    };

    useEffect(() => {
        fetchBooks();
        fetchReservedCount(); //  calls the updated function
        fetchMemberLibrary();
        fetchLibraryOptions();
    }, []);

    const handleConfirmReserve = async () => {
        if (currentReservedCount >= 3) {
            alert('You already have 3 active books. Cannot reserve more.');
            return;
        }
        if (lendingPeriod < 1 || lendingPeriod > 28) {
            alert('Lending period must be between 1 and 28 days.');
            return;
        }
        if (!returnLibraryId) {
            alert('Please select a return library.');
            return;
        }
        if (selectedBook?.bookCopyId) {
            await reserveBook(selectedBook.bookCopyId, lendingPeriod, returnLibraryId);
            setShowReserveModal(false);
        }
    };

    return (
        <div className="my-5">
            <h1 className="mb-4 fw-bold text-start">📖 Library Catalog</h1>

            {/* Filter */}
            <div className="card shadow-sm mb-4 border-0 rounded-4">
                <div className="card-body">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            fetchBooks();
                        }}
                    >
                        <div className="row">
                            <div className="col-md-3 mb-3">
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    placeholder="Category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    placeholder="Author"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <input
                                    type="text"
                                    className="form-control rounded-3"
                                    placeholder="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="col-md-3 mb-3">
                                <select
                                    className="form-control rounded-3"
                                    value={available}
                                    onChange={(e) => setAvailable(e.target.value)}
                                >
                                    <option value="">Availability</option>
                                    <option value="true">Available</option>
                                    <option value="false">Not Available</option>
                                </select>
                            </div>
                        </div>
                        <button className="btn btn-dark rounded-3 w-100 mt-2" type="submit">
                            🔍 Search
                        </button>
                    </form>
                </div>
            </div>

            {/* Book List */}
            <div className="list-group shadow-sm">
                {books.length > 0 ? (
                    books.map((book) => {
                        const isLimitReached = currentReservedCount >= 3;

                        return (
                            <div
                                key={book.bookCopyId || book.id}
                                className="list-group-item list-group-item-action d-flex align-items-center py-3"
                            >
                                {/* Cover image */}
                                <div
                                    className="me-3 d-flex align-items-center justify-content-center rounded overflow-hidden bg-light border"
                                    style={{ width: 60, height: 90 }}
                                >
                                    {coverCache[book.title] === undefined ? (
                                        <div className="spinner-border text-secondary" role="status" />
                                    ) : coverCache[book.title] ? (
                                        <img
                                            src={coverCache[book.title]!}
                                            alt={book.title}
                                            className="img-fluid h-100 w-100 object-fit-cover"
                                        />
                                    ) : (
                                        <div className="bg-secondary text-white d-flex align-items-center justify-content-center w-100 h-100">
                                            {book.title.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Main content */}
                                <div className="flex-grow-1">
                                    <div className="fw-semibold">
                                        {book.title} <span className="text-muted small">by {book.author}</span>
                                    </div>
                                    <div className="small text-muted">
                                        Category: {book.category || 'N/A'} | Location: {book.location || 'N/A'} | Status: {book.status || 'N/A'}
                                    </div>
                                </div>

                                {/* Reserve button */}
                                {isLoggedIn && role === 'Member' && book.status === 'Available' && (
                                    <button
                                        className={`btn btn-sm ${isLimitReached ? 'btn-secondary' : 'btn-outline-primary'} rounded-3 ms-3`}
                                        disabled={isLimitReached}
                                        onClick={
                                            !isLimitReached
                                                ? () => {
                                                      setSelectedBook(book);
                                                      setReturnLibraryId(memberLibraryId);
                                                      setShowReserveModal(true);
                                                  }
                                                : undefined
                                        }
                                        title={
                                            isLimitReached
                                                ? 'You have reached the maximum of 3 books.'
                                                : 'Click to reserve this book.'
                                        }
                                    >
                                        Reserve
                                    </button>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="list-group-item text-center text-muted py-4">No books found.</div>
                )}
            </div>

            {/* Reserve Modal */}
            {showReserveModal && selectedBook && (
                <div className="modal d-block" tabIndex={-1} role="dialog" onClick={() => setShowReserveModal(false)}>
                    <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content rounded-4">
                            <div className="modal-header">
                                <h5 className="modal-title">Reserve: {selectedBook.title}</h5>
                                <button type="button" className="btn-close" onClick={() => setShowReserveModal(false)} />
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Lending Period (1-28 days)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min={1}
                                        max={28}
                                        value={lendingPeriod}
                                        onChange={(e) => setLendingPeriod(Number(e.target.value))}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Place of Return</label>
                                    <select
                                        className="form-control"
                                        value={returnLibraryId !== null ? String(returnLibraryId) : ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setReturnLibraryId(val === '' ? null : Number(val));
                                        }}
                                    >
                                        <option value="">Select a library</option>
                                        {libraryOptions.map((lib) => (
                                            <option key={lib.id} value={String(lib.id)}>
                                                {lib.name} - {lib.location}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowReserveModal(false)}>
                                    Cancel
                                </button>
                                <button className="btn btn-primary" onClick={handleConfirmReserve}>
                                    Confirm Reserve
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookList;
