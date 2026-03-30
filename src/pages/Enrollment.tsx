import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useLocation } from "wouter";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_SLOTS = [
  "06:00-08:00",
  "08:00-10:00",
  "10:00-12:00",
  "12:00-14:00",
  "14:00-16:00",
  "16:00-18:00",
  "18:00-20:00",
  "20:00-22:00",
];

export default function Enrollment() {
  const [, setLocation] = useLocation();
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [tier, setTier] = useState<"standard" | "elite">("standard");
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [timezone, setTimezone] = useState<string>("");

  const { data: courses, isLoading } = trpc.enrollment.getCourses.useQuery();
  const createEnrollment = trpc.enrollment.createEnrollment.useMutation({
    onSuccess: () => {
      toast.success("Enrollment Submitted", {
        description: "Your enrollment has been submitted successfully. Awaiting payment confirmation.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast.error("Enrollment Failed", {
        description: error.message,
      });
    },
  });

  useEffect(() => {
    // Detect user's timezone
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimezone(detectedTimezone);
  }, []);

  const handleDayToggle = (day: string) => {
    setPreferredDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleTimeToggle = (time: string) => {
    setPreferredTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = () => {
    if (!selectedCourse) {
      toast.error("Course Required", {
        description: "Please select a course to enroll in.",
      });
      return;
    }

    if (tier === "elite" && (preferredDays.length === 0 || preferredTimes.length === 0)) {
      toast.error("Preferences Required", {
        description: "Please select your preferred days and times for Elite enrollment.",
      });
      return;
    }

    createEnrollment.mutate({
      courseId: selectedCourse,
      tier,
      preferredDays: tier === "elite" ? preferredDays : undefined,
      preferredTimes: tier === "elite" ? preferredTimes : undefined,
      timezone: tier === "elite" ? timezone : undefined,
    });
  };

  const selectedCourseData = courses?.find((c) => c.id === selectedCourse);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#4169E1] mb-2">Transform Your Math Journey</h1>
        <p className="text-gray-600">
          SCHROOL's proprietary 5QHackMath method delivers results where traditional tutoring fails.
          Specialized for struggling students with proven transformation outcomes.
        </p>
      </div>

      {/* Course Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Your Course</CardTitle>
          <CardDescription>Choose the year level that matches your current grade</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedCourse?.toString()}
            onValueChange={(value) => setSelectedCourse(Number(value))}
          >
            {courses?.map((course) => (
              <div
                key={course.id}
                className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50"
              >
                <RadioGroupItem value={course.id.toString()} id={`course-${course.id}`} />
                <div className="flex-1">
                  <Label htmlFor={`course-${course.id}`} className="cursor-pointer">
                    <div className="font-semibold text-lg">{course.yearLevel}</div>
                    <div className="text-sm text-gray-600 mt-1">{course.description}</div>
                    <div className="text-sm text-gray-500 mt-2">
                      Duration: {course.durationWeeks} weeks
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Tier Selection */}
      {selectedCourseData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Choose Your Enrollment Tier</CardTitle>
            <CardDescription>
              Standard includes video lessons and exercises. Elite adds personalized Zoom sessions with expert teachers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={tier} onValueChange={(value) => setTier(value as "standard" | "elite")}>
              {/* Standard Tier */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="standard" id="tier-standard" />
                <div className="flex-1">
                  <Label htmlFor="tier-standard" className="cursor-pointer">
                    <div className="font-semibold text-lg">Standard</div>
                    <div className="text-2xl font-bold text-[#4169E1] mt-1">
                      ${selectedCourseData.standardPrice}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 mb-2">Self-paced learning with comprehensive support</p>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>✓ Complete video lesson library</li>
                      <li>✓ 8/10 progression rule system</li>
                      <li>✓ Online phone tutor support</li>
                      <li>✓ Progress tracking dashboard</li>
                      <li>✓ PDF resources & solutions</li>
                    </ul>
                  </Label>
                </div>
              </div>

              {/* Elite Tier */}
              <div className="flex items-start space-x-3 p-4 border-2 border-[#4169E1] rounded-lg hover:bg-blue-50">
                <RadioGroupItem value="elite" id="tier-elite" />
                <div className="flex-1">
                  <Label htmlFor="tier-elite" className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">Elite</span>
                      <span className="bg-[#4169E1] text-white text-xs px-2 py-1 rounded">TRANSFORMATION PROGRAM</span>
                    </div>
                    <div className="text-2xl font-bold text-[#4169E1] mt-1">
                      ${selectedCourseData.elitePrice}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 mb-2">Complete transformation system for struggling students</p>
                    <ul className="text-sm text-gray-600 mt-2 space-y-1">
                      <li>✓ Everything in Standard, PLUS:</li>
                      <li>✓ {selectedCourseData.sessionsCount} live 1-on-1 specialist sessions</li>
                      <li>✓ Proprietary 5QHackMath method</li>
                      <li>✓ Pre-trained specialist teachers ($30/session value)</li>
                      <li>✓ Twice-weekly personalized guidance ({selectedCourseData.durationWeeks} weeks)</li>
                      <li>✓ Expert matching: timezone + grade level</li>
                      <li>✓ Direct teacher messaging & support</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700">
                        Per-session value: ${(parseFloat(selectedCourseData.elitePrice) / selectedCourseData.sessionsCount).toFixed(2)}
                      </p>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      )}

      {/* Elite Preferences */}
      {tier === "elite" && selectedCourseData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Session Preferences</CardTitle>
            <CardDescription>
              Select your preferred days and times. We'll match you with an available teacher. Your timezone: {timezone}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preferred Days */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Preferred Days (select at least 2)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={preferredDays.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <Label htmlFor={`day-${day}`} className="cursor-pointer">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Times */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Preferred Time Slots</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {TIME_SLOTS.map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={`time-${time}`}
                      checked={preferredTimes.includes(time)}
                      onCheckedChange={() => handleTimeToggle(time)}
                    />
                    <Label htmlFor={`time-${time}`} className="cursor-pointer">
                      {time}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold mb-1">Note:</p>
              <p>
                We'll automatically assign you a qualified teacher based on your preferences and their availability. 
                You may not always get your exact preferred times, but we'll match you with the best available option.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {selectedCourseData && (
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setLocation("/")}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createEnrollment.isPending}
            className="bg-[#4169E1] hover:bg-[#3557c7]"
          >
            {createEnrollment.isPending ? "Processing..." : "Submit Enrollment"}
          </Button>
        </div>
      )}
    </div>
  );
}
