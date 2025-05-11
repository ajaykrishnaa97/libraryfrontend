import React, { useEffect, useState } from "react";
import axios from "axios";

interface MyReservation {
  id: number;
  reservedAt: string;
  expiresAt: string;
  returnLocation: string;
  bookTitle: string;
  bookAuthor: string;
  bookCopyLocation: string;
  status: string;
}

const MyReservations: React.FC = () => {
  const [reservations, setReservations] = useState<MyReservation[]>([]);
  const [coverCache, setCoverCache] = useState<{
    [title: string]: string | null;
  }>({});

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<MyReservation[]>(
        "https://library-server-hxcjb5h7dhegcff8.canadacentral-01.azurewebsites.net/books/my-reservations",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReservations(response.data);

      response.data.forEach((res) => {
        if (!coverCache[res.bookTitle]) {
          fetchBookCover(res.bookTitle);
        }
      });
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  const fetchBookCover = async (title: string) => {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
          title
        )}`
      );
      const items = response.data.items;
      if (items && items.length > 0) {
        const thumbnail = items[0].volumeInfo.imageLinks?.thumbnail;
        if (thumbnail) {
          setCoverCache((prev) => ({ ...prev, [title]: thumbnail }));
          return;
        }
      }
    } catch (err) {
      console.error(`Error fetching cover for ${title}:`, err);
    }
    setCoverCache((prev) => ({ ...prev, [title]: null }));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div className="my-5">
      <h2 className="mb-4 fw-bold text-start">📋 My Reservations</h2>

      {reservations.length > 0 ? (
        reservations.map((res) => (
          <div
            key={res.id}
            className="card shadow-sm mb-3 border-0 rounded-4 d-flex flex-row align-items-center p-2"
          >
            {/* Cover image */}
            <div
              className="me-3 d-flex align-items-center justify-content-center rounded overflow-hidden bg-light border"
              style={{ width: 60, height: 90 }}
            >
              {coverCache[res.bookTitle] === undefined ? (
                <div className="spinner-border text-secondary" role="status" />
              ) : coverCache[res.bookTitle] ? (
                <img
                  src={coverCache[res.bookTitle]!}
                  alt={res.bookTitle}
                  className="img-fluid h-100 w-100 object-fit-cover"
                />
              ) : (
                <div className="bg-secondary text-white d-flex align-items-center justify-content-center w-100 h-100">
                  {res.bookTitle.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Main content */}
            <div className="flex-grow-1">
              <div className="fw-semibold">
                {res.bookTitle}{" "}
                <span className="text-muted small">by {res.bookAuthor}</span>
              </div>
              <div className="small text-muted mb-1">
                📍 <strong>Copy:</strong> {res.bookCopyLocation} | 🏠{" "}
                <strong>Return:</strong> {res.returnLocation}
              </div>
              <div className="small text-muted mb-1">
                📅 <strong>Reserved:</strong>{" "}
                {new Date(res.reservedAt).toLocaleString()}
              </div>
              <div className="small text-muted">
                ⏰ <strong>Expires:</strong>{" "}
                {new Date(res.expiresAt).toLocaleString()}
              </div>
            </div>

            <span
              className={`badge ${
                res.status === "Active" ? "bg-success" : "bg-secondary"
              } rounded-pill ms-3`}
            >
              {res.status}
            </span>
          </div>
        ))
      ) : (
        <div className="text-center text-muted py-4">
          No active reservations.
        </div>
      )}
    </div>
  );
};

export default MyReservations;
