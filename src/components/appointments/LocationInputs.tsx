
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationInputsProps {
  room: string;
  block: string;
  onRoomChange: (value: string) => void;
  onBlockChange: (value: string) => void;
}

export const LocationInputs = ({
  room,
  block,
  onRoomChange,
  onBlockChange
}: LocationInputsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="space-y-2">
        <Label htmlFor="room">Sala</Label>
        <Input
          id="room"
          value={room}
          onChange={(e) => onRoomChange(e.target.value)}
          placeholder="Número da sala"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="block">Bloco</Label>
        <Input
          id="block"
          value={block}
          onChange={(e) => onBlockChange(e.target.value)}
          placeholder="Número/letra do bloco"
        />
      </div>
    </div>
  );
};
