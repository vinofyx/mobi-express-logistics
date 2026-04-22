import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import axios from "axios";

const CustomerNew = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/customers", {
        name,
        phone,
        address
      });

      alert("Customer created successfully");
    } catch (err) {
      alert("Error");
    }
  };

  return (
    <div className="p-6">
      <h2>Add Customer</h2>

      <form onSubmit={handleSubmit}>
        <input placeholder="Name" onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Phone" onChange={(e)=>setPhone(e.target.value)} />
        <input placeholder="Address" onChange={(e)=>setAddress(e.target.value)} />

        <button>Create</button>
      </form>
    </div>
  );
};

export const Route = createFileRoute("/dashboard/customer/new")({
  component: CustomerNew,
});
