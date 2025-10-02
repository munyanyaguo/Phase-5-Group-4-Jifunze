// // src/pages/Educator/UserForm.jsx
// import React, { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useNavigate } from "react-router-dom";

// const UserForm = ({ onSubmit, initialData }) => {
//   const [formData, setFormData] = useState(
//     initialData || {
//       name: "",
//       email: "",
//       role: "student", // default role
//     }
//   );

//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.name || !formData.email) {
//       alert("Please fill in all fields");
//       return;
//     }
//     onSubmit?.(formData);
//     navigate("/educator/students"); // redirect after submit
//   };

//   return (
//     <div className="p-6">
//       <Card className="max-w-lg mx-auto shadow-md rounded-2xl">
//         <CardHeader>
//           <CardTitle>
//             {initialData ? "Edit Student" : "Add New Student"}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form className="space-y-4" onSubmit={handleSubmit}>
//             {/* Name */}
//             <div>
//               <Label htmlFor="name">Full Name</Label>
//               <Input
//                 id="name"
//                 name="name"
//                 type="text"
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Enter student name"
//                 required
//               />
//             </div>

//             {/* Email */}
//             <div>
//               <Label htmlFor="email">Email Address</Label>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 placeholder="Enter student email"
//                 required
//               />
//             </div>

//             {/* Role */}
//             <div>
//               <Label htmlFor="role">Role</Label>
//               <select
//                 id="role"
//                 name="role"
//                 value={formData.role}
//                 onChange={handleChange}
//                 className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-400"
//               >
//                 <option value="student">Student</option>
//                 <option value="educator">Educator</option>
//               </select>
//             </div>

//             {/* Buttons */}
//             <div className="flex justify-end space-x-3 pt-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => navigate(-1)}
//               >
//                 Cancel
//               </Button>
//               <Button type="submit">
//                 {initialData ? "Update" : "Create"}
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default UserForm;
