import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bold, Italic, Underline, Image as ImageIcon, Youtube, Plus } from "lucide-react";

interface AnnouncementEditorProps {
  newAnnouncement: string;
  youtubeUrl: string;
  onAnnouncementChange: (value: string) => void;
  onYoutubeUrlChange: (value: string) => void;
}

export const AnnouncementEditor = ({
  newAnnouncement,
  youtubeUrl,
  onAnnouncementChange,
  onYoutubeUrlChange,
}: AnnouncementEditorProps) => {
  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="text">Texto</TabsTrigger>
        <TabsTrigger value="youtube">YouTube</TabsTrigger>
      </TabsList>

      <TabsContent value="text">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Bold className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Italic className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Underline className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button variant="secondary" onClick={() => onAnnouncementChange(newAnnouncement + '\n')}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Texto
              </Button>
            </div>
            <Textarea
              value={newAnnouncement}
              onChange={(e) => onAnnouncementChange(e.target.value)}
              placeholder="Digite seu anúncio aqui..."
              className="min-h-[200px]"
            />
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="youtube">
        <Card className="p-6">
          <div className="space-y-4">
            <Input
              value={youtubeUrl}
              onChange={(e) => onYoutubeUrlChange(e.target.value)}
              placeholder="Cole o URL do vídeo do YouTube aqui..."
            />
            <Youtube className="h-8 w-8 mx-auto text-gray-400" />
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};