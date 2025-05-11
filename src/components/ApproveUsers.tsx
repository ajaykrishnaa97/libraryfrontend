import React, { useState, useEffect } from "react";
import axios from "axios";

interface User {
  id: number;
  email: string;
  role: string;
  isApproved: boolean;
}

const ApproveUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<User[]>(
        "http://localhost:5134/api/Auth/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  const approveUser = async (userId: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5134/api/Auth/approve/${userId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert(" User approved!");
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error approving user:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="mb-4 fw-bold">👥 Approve Users</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="card shadow border-0 rounded-4">
          <div className="card-header bg-light border-0">
            <h5 className="mb-0 fw-semibold">Pending Approvals</h5>
          </div>
          <ul className="list-group list-group-flush">
            {users.filter((u) => !u.isApproved).length > 0 ? (
              users
                .filter((user) => !user.isApproved)
                .map((user) => (
                  <li
                    key={user.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{user.email}</strong> ({user.role})
                    </div>
                    <button
                      className="btn btn-success btn-sm rounded-3"
                      onClick={() => approveUser(user.id)}
                    >
                      Approve
                    </button>
                  </li>
                ))
            ) : (
              <li className="list-group-item text-muted text-center">
                No users awaiting approval.
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ApproveUsers;
