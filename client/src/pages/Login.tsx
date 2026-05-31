import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");

  const utils = trpc.useUtils();

  const sendOtp = trpc.auth.sendOtp.useMutation({
    onSuccess: () => {
      setStep("otp");
      toast.success("OTP bhej diya! Email check karein.");
    },
    onError: (err) => toast.error(err.message),
  });

  const verifyOtp = trpc.auth.verifyOtp.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("Login successful!");
      setLocation("/dashboard");
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto">
            <span className="text-white text-xl font-bold">P</span>
          </div>
          <h1 className="text-2xl font-semibold">Pathology Lab Portal</h1>
          <p className="text-muted-foreground text-sm">
            {step === "email" ? "Login ke liye email enter karein" : `OTP ${email} pe bheja gaya hai`}
          </p>
        </div>

        {step === "email" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="aapka@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendOtp.mutate({ email })}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => sendOtp.mutate({ email })}
              disabled={!email || sendOtp.isPending}
            >
              {sendOtp.isPending ? "Bhej rahe hain..." : "OTP Bhejo"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">6-Digit Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && verifyOtp.mutate({ email, code })}
                className="text-center text-2xl tracking-widest"
              />
            </div>
            <Button
              className="w-full"
              onClick={() => verifyOtp.mutate({ email, code })}
              disabled={code.length !== 6 || verifyOtp.isPending}
            >
              {verifyOtp.isPending ? "Verify ho raha hai..." : "Login Karein"}
            </Button>
            <button
              className="w-full text-sm text-muted-foreground hover:underline"
              onClick={() => { setStep("email"); setCode(""); }}
            >
              Wapas jaayein
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
