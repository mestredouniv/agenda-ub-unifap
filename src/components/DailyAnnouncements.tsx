import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface Announcement {
  id: number;
  text: string;
  createdAt: Date;
}

export const DailyAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState("");

  const addAnnouncement = () => {
    if (!newAnnouncement.trim()) return;

    const announcement: Announcement = {
      id: Date.now(),
      text: newAnnouncement,
      createdAt: new Date(),
    };

    setAnnouncements([announcement, ...announcements]);
    setNewAnnouncement("");

    // Remove announcement after 12 hours
    setTimeout(() => {
      setAnnouncements(current => 
        current.filter(a => a.id !== announcement.id)
      );
    }, 12 * 60 * 60 * 1000); // 12 hours in milliseconds
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 animate-fade-in">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Avisos do Dia</h2>
        
        <div className="flex gap-2 mb-4">
          <Input
            value={newAnnouncement}
            onChange={(e) => setNewAnnouncement(e.target.value)}
            placeholder="Digite um novo aviso..."
            className="flex-1"
          />
          <Button
            onClick={addAnnouncement}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="p-3 bg-gray-50 rounded-md text-sm"
            >
              {announcement.text}
            </div>
          ))}
          
          {announcements.length === 0 && (
            <p className="text-gray-500 text-sm text-center">
              Nenhum aviso para hoje
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};