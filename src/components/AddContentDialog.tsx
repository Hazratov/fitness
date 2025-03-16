import React from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Utensils, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

// Match the props interface with how the component is being used
interface AddContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddContentDialog: React.FC<AddContentDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  
  const handleExerciseClick = () => {
    // Navigate directly to the URL with the type parameter
    navigate("/add-content?type=mashqlar");
    onClose();
  };
  
  const handleMealClick = () => {
    // Navigate directly to the URL with the type parameter
    navigate("/add-content?type=taomnnoma");
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#111827] border-[#2a3547] text-white max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Kontent qo'shish</DialogTitle>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
          {/* Exercise Option */}
          <div 
            className="bg-gradient-to-br from-[#1a2336] to-[#1e293b] p-8 rounded-xl border border-[#2a3547] hover:shadow-lg hover:border-[#3b82f6]/30 transition-all cursor-pointer"
            onClick={handleExerciseClick}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#3b82f6]/20 text-[#3b82f6] mb-4">
              <Dumbbell size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Mashqlar qo'shish</h2>
            <p className="text-gray-400">
              Yangi mashqlar blokini qo'shing. Mashqlar, kaloriyalar, davomiylik va boshqalarni sozlang.
            </p>
          </div>
          
          {/* Meal Option */}
          <div 
            className="bg-gradient-to-br from-[#1a2336] to-[#1e293b] p-8 rounded-xl border border-[#2a3547] hover:shadow-lg hover:border-[#10b981]/30 transition-all cursor-pointer"
            onClick={handleMealClick}
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#10b981]/20 text-[#10b981] mb-4">
              <Utensils size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Taomnnoma qo'shish</h2>
            <p className="text-gray-400">
              Yangi taomlar qo'shing. Tayyorlash ketma-ketligi, kaloriyalar, tayyorlash vaqti va boshqalarni kiriting.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddContentDialog;