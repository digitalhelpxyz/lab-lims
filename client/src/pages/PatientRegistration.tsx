import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function PatientRegistration() {
  const [, setLocation] = useLocation();
  const createPatient = trpc.patients.create.useMutation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    sampleId: "",
    age: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    doctorName: "",
    doctorPhone: "",
    doctorEmail: "",
    referralNotes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPatient.mutateAsync({
        ...formData,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: (formData.gender || undefined) as "male" | "female" | "other" | undefined,
      });
      toast.success("Patient registered successfully");
      setLocation("/patients");
    } catch (error) {
      toast.error("Failed to register patient");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Patient Registration</h1>
        <p className="text-slate-600 dark:text-slate-400">Add a new patient to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name *</label>
                <Input
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="form-label">Last Name *</label>
                <Input
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Sample ID *</label>
                <Input
                  required
                  value={formData.sampleId}
                  onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                  placeholder="LAB-2026-001"
                />
              </div>
              <div>
                <label className="form-label">Age</label>
                <Input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Gender</label>
                <Select value={formData.gender || ""} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="form-label">Phone</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="form-label">Address</label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main St, City, State 12345"
              />
            </div>

            <hr />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Referring Doctor</label>
                <Input
                  value={formData.doctorName}
                  onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
                  placeholder="Dr. Smith"
                />
              </div>
              <div>
                <label className="form-label">Doctor Phone</label>
                <Input
                  type="tel"
                  value={formData.doctorPhone}
                  onChange={(e) => setFormData({ ...formData, doctorPhone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Doctor Email</label>
              <Input
                type="email"
                value={formData.doctorEmail}
                onChange={(e) => setFormData({ ...formData, doctorEmail: e.target.value })}
                placeholder="doctor@example.com"
              />
            </div>

            <div>
              <label className="form-label">Referral Notes</label>
              <Textarea
                value={formData.referralNotes}
                onChange={(e) => setFormData({ ...formData, referralNotes: e.target.value })}
                placeholder="Any additional notes from the doctor..."
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={createPatient.isPending}>
                {createPatient.isPending ? "Registering..." : "Register Patient"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setLocation("/patients")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
