import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function TestCatalog() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    testName: "",
    category: "",
    referenceRangeMin: "",
    referenceRangeMax: "",
    unit: "",
  });

  const { data: tests, isLoading, refetch } = trpc.labTests.list.useQuery({});
  const createTest = trpc.labTests.create.useMutation();
  const updateTest = trpc.labTests.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateTest.mutateAsync({
          id: editingId,
          testName: formData.testName,
          category: formData.category,
          referenceRangeMin: parseFloat(formData.referenceRangeMin),
          referenceRangeMax: parseFloat(formData.referenceRangeMax),
          unit: formData.unit,
        });
        toast.success("Test updated successfully");
      } else {
        await createTest.mutateAsync({
          testName: formData.testName,
          testCode: formData.testName.toUpperCase().replace(/\s+/g, "_"),
          category: formData.category,
          referenceRangeMin: parseFloat(formData.referenceRangeMin),
          referenceRangeMax: parseFloat(formData.referenceRangeMax),
          unit: formData.unit,
        });
        toast.success("Test created successfully");
      }
      resetForm();
      refetch();
    } catch (error) {
      toast.error("Failed to save test");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this test?")) {
      try {
        await updateTest.mutateAsync({ id, isActive: false });
        toast.success("Test deactivated successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to deactivate test");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      testName: "",
      category: "",
      referenceRangeMin: "",
      referenceRangeMax: "",
      unit: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Test Catalog</h1>
          <p className="text-slate-600 mt-2">Manage laboratory tests and reference ranges</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Test
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Test" : "Add New Test"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Test Name *</label>
                  <Input
                    required
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    placeholder="Blood Glucose"
                  />
                </div>
                <div>
                  <label className="form-label">Category *</label>
                  <Input
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Chemistry"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="form-label">Min Range *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formData.referenceRangeMin}
                    onChange={(e) => setFormData({ ...formData, referenceRangeMin: e.target.value })}
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="form-label">Max Range *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={formData.referenceRangeMax}
                    onChange={(e) => setFormData({ ...formData, referenceRangeMax: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div>
                  <label className="form-label">Unit *</label>
                  <Input
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="mg/dL"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="btn-primary">
                  {editingId ? "Update Test" : "Create Test"}
                </Button>
                <Button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tests Table */}
      <Card className="card-elevated">
        <CardHeader>
          <CardTitle>Available Tests ({tests?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {tests && tests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left">Test Name</th>
                    <th className="text-left">Category</th>
                    <th className="text-left">Reference Range</th>
                    <th className="text-left">Unit</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tests.map((test) => (
                    <tr key={test.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{test.testName}</td>
                      <td className="py-3 px-4">{test.category}</td>
                      <td className="py-3 px-4">{test.referenceRangeText || `${test.referenceRangeMin}-${test.referenceRangeMax}`}</td>
                      <td className="py-3 px-4">{test.unit}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setFormData({
                                testName: test.testName,
                                category: test.category,
                                referenceRangeMin: test.referenceRangeMin || "",
                                referenceRangeMax: test.referenceRangeMax || "",
                                unit: test.unit || "",
                              });
                              setEditingId(test.id);
                              setShowForm(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(test.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-slate-600 py-8">No tests available. Create one to get started.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
