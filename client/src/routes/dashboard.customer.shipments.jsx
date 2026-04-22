import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
import axios from "axios";

const CustomerShipments = () => {
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/shipments");
      setShipments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2>Shipments</h2>

      <table border="1" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((s, i) => (
            <tr key={i}>
              <td>{s._id}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const Route = createFileRoute("/dashboard/customer/shipments")({
  component: CustomerShipments,
});
