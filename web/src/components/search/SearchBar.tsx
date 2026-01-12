import { InputAdornment, TextField } from "@mui/material";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <TextField
      fullWidth
      size="small"
      placeholder={placeholder || "Search…"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <MagnifyingGlassIcon />
          </InputAdornment>
        ),
      }}
    />
  );
}
