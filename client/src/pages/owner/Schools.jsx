// client/src/pages/owner/Schools.jsx
import React, { useEffect, useState } from "react";
import { getMySchool, deleteSchool } from "../../api";
import SchoolForm from "../../components/owner/SchoolForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, PlusCircle } from "lucide-react";

export default function Schools() {
  const [school, setSchool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  // Fetch owner’s school
  useEffect(() => {
    async function fetchSchool() {
      try {
        const data = await getMySchool();
        setSchool(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSchool();
  }, []);

  const handleDelete = async () => {
    if (!school) return;
    if (!confirm("Are you sure you want to delete this school?")) return;

    try {
      await deleteSchool(school.id);
      setSchool(null);
    } catch (err) {
      alert("Failed to delete school");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">My School</h2>

      {loading ? (
        <p>Loading...</p>
      ) : school ? (
        <Card className="shadow-lg rounded-2xl border p-4 max-w-md">
          <CardContent className="space-y-3">
            <h3 className="text-xl font-semibold">{school.name}</h3>
            <p className="text-gray-600">{school.description}</p>
            <p className="text-sm text-gray-500">Location: {school.location}</p>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setEditData(school);
                  setShowForm(true);
                }}
              >
                <Pencil className="w-4 h-4 mr-1" /> Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-1" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <p className="mb-4">You don’t have a school yet.</p>
          <Button onClick={() => setShowForm(true)}>
            <PlusCircle className="w-4 h-4 mr-1" /> Create School
          </Button>
        </div>
      )}

      {showForm && (
        <SchoolForm
          initialData={editData}
          onClose={() => {
            setShowForm(false);
            setEditData(null);
          }}
          onSuccess={(newSchool) => {
            setSchool(newSchool);
            setShowForm(false);
            setEditData(null);
          }}
        />
      )}
    </div>
  );
}
