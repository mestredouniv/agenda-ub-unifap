
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearch: () => void;
}

export const SearchBar = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
}: SearchBarProps) => {
  return (
    <div className="flex gap-2">
      <Input
        placeholder="Buscar por nome, CPF ou número do SUS"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
      />
      <Button onClick={onSearch}>
        <Search className="mr-2" />
        Buscar
      </Button>
    </div>
  );
};
