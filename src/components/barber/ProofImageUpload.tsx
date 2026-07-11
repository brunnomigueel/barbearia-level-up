import { useRef, useState } from "react";
import { Camera, X, Upload } from "lucide-react";

interface ProofImageUploadProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
  required?: boolean;
}

export function ProofImageUpload({
  value,
  onChange,
  label = "Comprovante / Print",
  required = false,
}: ProofImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
        <Camera className="h-4 w-4 text-primary" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>

      {!value ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            w-full min-h-[80px] rounded-xl border-2 border-dashed
            flex flex-col items-center justify-center gap-2 p-4
            transition-all duration-200 cursor-pointer
            active:scale-[0.98]
            ${
              dragOver
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50 hover:bg-primary/5"
            }
          `}
        >
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Toque para anexar o print
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              JPG, PNG ou WebP
            </p>
          </div>
        </button>
      ) : (
        <div className="relative group rounded-xl overflow-hidden border border-border bg-card">
          <img
            src={value}
            alt="Comprovante"
            className="w-full max-h-[200px] object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange(null)}
              className="bg-destructive text-destructive-foreground rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 shadow-lg md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
