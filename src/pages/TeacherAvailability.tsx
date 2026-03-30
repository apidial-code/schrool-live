import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Clock } from "lucide-react";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

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

type AvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

export default function TeacherAvailability() {
  const [, setLocation] = useLocation();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);

  const { data: profile, isLoading: profileLoading } = trpc.teacher.getMyTeacherProfile.useQuery();
  const { data: existingAvailability, isLoading: availabilityLoading } =
    trpc.teacher.getMyAvailability.useQuery();

  const saveMutation = trpc.teacher.setAvailability.useMutation({
    onSuccess: () => {
      toast.success("Availability updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update availability");
    },
  });

  // Load existing availability
  useEffect(() => {
    if (existingAvailability && existingAvailability.length > 0) {
      setSlots(
        existingAvailability.map((slot) => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          timezone: slot.timezone,
        }))
      );
    }
  }, [existingAvailability]);

  const addSlot = () => {
    setSlots([
      ...slots,
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        timezone: profile?.timezone || "UTC",
      },
    ]);
  };

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof AvailabilitySlot, value: any) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const handleSave = () => {
    // Validate slots
    for (const slot of slots) {
      if (slot.startTime >= slot.endTime) {
        toast.error("End time must be after start time for all slots");
        return;
      }
    }

    saveMutation.mutate({ slots });
  };

  if (profileLoading || availabilityLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="container max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Profile Required</CardTitle>
              <CardDescription>
                You need to apply as a teacher before setting your availability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/teacher/apply")}>Apply as Teacher</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Clock className="h-8 w-8" />
              Set Your Availability
            </CardTitle>
            <CardDescription>
              Define your weekly teaching availability. Students will be matched based on these time slots.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Availability Slots */}
            <div className="space-y-4">
              {slots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No availability slots set yet.</p>
                  <p className="text-sm">Click "Add Time Slot" to get started.</p>
                </div>
              ) : (
                slots.map((slot, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Day of Week */}
                      <div className="space-y-2">
                        <Label>Day</Label>
                        <select
                          value={slot.dayOfWeek}
                          onChange={(e) => updateSlot(index, "dayOfWeek", parseInt(e.target.value))}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {DAYS_OF_WEEK.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Start Time */}
                      <div className="space-y-2">
                        <Label>Start Time</Label>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) => updateSlot(index, "startTime", e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>

                      {/* End Time */}
                      <div className="space-y-2">
                        <Label>End Time</Label>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) => updateSlot(index, "endTime", e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        />
                      </div>

                      {/* Timezone */}
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <select
                          value={slot.timezone}
                          onChange={(e) => updateSlot(index, "timezone", e.target.value)}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                          {TIMEZONES.map((tz) => (
                            <option key={tz} value={tz}>
                              {tz}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeSlot(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Add Slot Button */}
            <Button onClick={addSlot} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Time Slot
            </Button>

            {/* Save Button */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || slots.length === 0}
                className="flex-1"
              >
                {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Availability
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation("/dashboard")}
                disabled={saveMutation.isPending}
              >
                Cancel
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Your availability will be used to match you with students in compatible timezones.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
