import React from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, ClipboardList, MessageSquare } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
      {/* Hero Section */}
<section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 bg-cover bg-center bg-no-repeat bg-[url('/hero2.jpg')]">
  {/* Overlay gradient for readability */}
  <div className="absolute inset-0 bg-gradient-to-r from-indigo-800/70 via-purple-800/70 to-pink-800/70"></div>

  {/* Content on top */}
  <div className="relative z-10">
    <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white drop-shadow-lg">
      Welcome to Jifunze
    </h1>
    <p className="text-lg md:text-xl max-w-2xl mb-8 text-white drop-shadow">
      A complete online school system designed for <span className="font-semibold">students, educators, and school owners</span>.  
      Manage classes, track attendance, share resources, and collaborate — all in one platform.
    </p>
    <div className="space-x-4">
      <Link
        to="/register"
        className="bg-yellow-400 text-indigo-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition transform hover:scale-105 shadow-lg"
      >
        Get Started
      </Link>
      <Link
        to="/login"
        className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition transform hover:scale-105 shadow-lg"
      >
        Login
      </Link>
    </div>
  </div>
</section>

      {/* Features Section */}
      <section className="bg-purple text-gray-800 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose Jifunze?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="card text-center">
            <Users className="mx-auto text-indigo-600 w-12 h-12 mb-4" />
            <h3 className="font-bold text-lg mb-2">School Management</h3>
            <p>Create and manage schools, educators, and students with ease.</p>
          </div>
          <div className="card text-center">
            <BookOpen className="mx-auto text-green-600 w-12 h-12 mb-4" />
            <h3 className="font-bold text-lg mb-2">Resources</h3>
            <p>Upload and share notes, books, and past papers securely.</p>
          </div>
          <div className="card text-center">
            <ClipboardList className="mx-auto text-pink-600 w-12 h-12 mb-4" />
            <h3 className="font-bold text-lg mb-2">Exams & Assessments</h3>
            <p>Conduct quizzes and exams online with anti-cheating measures.</p>
          </div>
          <div className="card text-center">
            <MessageSquare className="mx-auto text-yellow-600 w-12 h-12 mb-4" />
            <h3 className="font-bold text-lg mb-2">Classroom Interaction</h3>
            <p>Engage through chat and discussion boards for real collaboration.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 text-center bg-indigo-700 bg-cover bg-center bg-[url('/hero1.jpg')]">
        <h2 className="text-3xl font-bold mb-6">Ready to Transform Learning?</h2>
        <p className="mb-8 text-lg">Join thousands of schools moving education online with Jifunze.</p>
        <Link
          to="/register"
          className="bg-yellow-400 text-indigo-900 px-8 py-4 rounded-lg font-bold hover:bg-yellow-300 transition"
        >
          Create an Account
        </Link>
      </section>

    
     {/* Footer */}
<footer className="relative bg-indigo-900 text-white text-center py-6 text-sm ">
  {/* Overlay for readability */}
  <div className="absolute inset-0 bg-indigo-900/80"></div>

  <div className="relative z-10">
   
    <p>© {new Date().getFullYear()} Jifunze. All Rights Reserved.</p>
  </div>
</footer>

    </div>
  );
};

export default LandingPage;
