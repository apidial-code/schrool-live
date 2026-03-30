import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

const YEAR_LEVELS = ["Year 5/6", "Year 7", "Year 8", "Year 9"] as const;

export default function TeacherApplication() {
  const [, setLocation] = useLocation();
  const [qualifications, setQualifications] = useState("");
  const [experience, setExperience] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [specializations, setSpecializations] = useState<string[]>([]);

  const applyMutation = trpc.teacher.applyAsTeacher.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully! We'll review it soon.");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  const handleSpecializationToggle = (level: string) => {
    setSpecializations((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (specializations.length === 0) {
      toast.error("Please select at least one specialization");
      return;
    }

    applyMutation.mutate({
      qualifications,
      experience,
      bio,
      timezone,
      specializations: specializations as any,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Apply to Become a Teacher</CardTitle>
            <CardDescription>
              Join our team of expert mathematics educators and help transform struggling students into
              confident learners using the 5QHackMath method.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Qualifications */}
              <div className="space-y-2">
                <Label htmlFor="qualifications">
                  Qualifications <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="qualifications"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="List your educational qualifications, certifications, and relevant credentials..."
                  required
                  rows={4}
                  minLength={10}
                />
                <p className="text-sm text-muted-foreground">Minimum 10 characters</p>
              </div>

              {/* Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience">
                  Teaching Experience <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Describe your teaching experience, years taught, student age groups, subjects, and teaching methods..."
                  required
                  rows={4}
                  minLength={10}
                />
                <p className="text-sm text-muted-foreground">Minimum 10 characters</p>
              </div>

              {/* Specializations */}
              <div className="space-y-3">
                <Label>
                  Year Level Specializations <span className="text-red-500">*</span>
                </Label>
                <p className="text-sm text-muted-foreground">
                  Select the year levels you're qualified to teach (select at least one)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {YEAR_LEVELS.map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox
                        id={level}
                        checked={specializations.includes(level)}
                        onCheckedChange={() => handleSpecializationToggle(level)}
                      />
                      <Label htmlFor={level} className="cursor-pointer font-normal">
                        {level}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="timezone">
                  Timezone <span className="text-red-500">*</span>
                </Label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-muted-foreground">
                  Your primary timezone for teaching availability
                </p>
              </div>

              {/* Bio (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself, your teaching philosophy, and why you want to join SCHROOL..."
                  rows={4}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={applyMutation.isPending}
                  className="flex-1"
                >
                  {applyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Application
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard")}
                  disabled={applyMutation.isPending}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                After submitting, our admin team will review your application. You'll be notified via email
                once approved.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
