import React, { useState, FormEvent, useEffect } from "react";
import axios from "axios";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [libraryId, setLibraryId] = useState("");
  const [role, setRole] = useState("Member");
  const [message, setMessage] = useState("");
  const [libraries, setLibraries] = useState<
    { id: number; name: string; location: string }[]
  >([]);

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        const response = await axios.get(
          "https://library-server-hxcjb5h7dhegcff8.canadacentral-01.azurewebsites.net/api/Auth/libraries"
        );
        setLibraries(response.data);
      } catch (error) {
        console.error("Failed to load libraries", error);
      }
    };

    fetchLibraries();
  }, []);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(
        "https://library-server-hxcjb5h7dhegcff8.canadacentral-01.azurewebsites.net/api/Auth/register",
        {
          name,
          phoneNumber,
          email,
          address,
          libraryId: parseInt(libraryId, 10),
          role,
        }
      );
      setMessage(
        "Registration successful! Check your email to set your password."
      );
    } catch (err: any) {
      console.error(err);
      if (
        axios.isAxiosError(err) &&
        err.response?.data === "Email already registered."
      ) {
        setMessage(
          '⚠️ This email is already registered. You can <a href="/forgot-password">reset your password here</a>.'
        );
      } else {
        setMessage("Registration failed. Try again.");
      }
    }
  };

  return (
    <div
      className="card shadow border-0 rounded-4 mx-auto"
      style={{ maxWidth: "600px", width: "100%" }}
    >
      <div className="card-header bg-light border-0">
        <h5 className="mb-0 fw-semibold">Register</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label fw-semibold">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="form-control rounded-3"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label fw-semibold">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className="form-control rounded-3"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-control rounded-3"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="address" className="form-label fw-semibold">
              Address
            </label>
            <input
              id="address"
              type="text"
              className="form-control rounded-3"
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="libraryId" className="form-label fw-semibold">
              Membership Location
            </label>
            <select
              id="libraryId"
              className="form-select rounded-3"
              value={libraryId}
              onChange={(e) => setLibraryId(e.target.value)}
              required
            >
              <option value="">Select a library location</option>
              {libraries.map((library) => (
                <option key={library.id} value={library.id}>
                  {library.name} - {library.location}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="role" className="form-label fw-semibold">
              Role
            </label>
            <select
              id="role"
              className="form-select rounded-3"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Member">Member</option>
              <option value="Librarian">Librarian</option>
            </select>
          </div>
          <button className="btn btn-dark w-100 rounded-3 py-2" type="submit">
            📨 Register
          </button>
        </form>
        {message && (
          <div
            className="alert alert-info mt-3"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        )}
      </div>
    </div>
  );
};

export default Register;
