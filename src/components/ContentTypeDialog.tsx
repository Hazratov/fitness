
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type ContentType = "mashqlar" | "taomnnoma";

interface ContentTypeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contentType: ContentType;
  onContentTypeChange: (type: ContentType) => void;
}

const ContentTypeDialog: React.FC<ContentTypeDialogProps> = ({
  isOpen,
  onOpenChange,
  contentType,
  onContentTypeChange
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a2336] border-[#2c3855] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Kontent qo'shish</DialogTitle>
          <DialogDescription className="text-gray-400">
            Qo'shmoqchi bo'lgan kontent turini tanlang
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <RadioGroup 
            defaultValue={contentType} 
            onValueChange={(value) => onContentTypeChange(value as ContentType)}
            className="flex flex-col space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mashqlar" id="mashqlar" />
              <Label htmlFor="mashqlar">Mashqlar</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="taomnnoma" id="taomnnoma" />
              <Label htmlFor="taomnnoma">Taomnnoma</Label>
            </div>
          </RadioGroup>
          <div className="flex justify-end">
            <Button 
              onClick={() => onOpenChange(false)} 
              className="bg-[#2563eb] hover:bg-[#1d54cf]"
            >
              Davom etish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentTypeDialog;
