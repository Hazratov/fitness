
import React from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Utensils, ArrowLeft, Home, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContentTypeSelection: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#111827] text-white">
      {/* Top Navigation */}
      <div className="bg-[#1a2336] py-3 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="text-xl font-bold">Fitness Admin</div>
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            className="flex items-center gap-2 bg-[#252e3f] hover:bg-[#2c374d] text-white border-0"
            onClick={() => navigate("/dashboard")}
          >
            <Home size={18} />
            <span>Asosiy</span>
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2 bg-[#252e3f] hover:bg-[#2c374d] text-white border-0"
            onClick={() => navigate("/content")}
          >
            <FileText size={18} />
            <span>Kontentlar</span>
          </Button>
        </div>
      </div>
      
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            className="mr-4 text-gray-400 hover:text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold">Kontent qo'shish</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Exercise Option */}
          <div 
            className="bg-gradient-to-br from-[#1a2336] to-[#1e293b] p-8 rounded-xl border border-[#2a3547] hover:shadow-lg hover:border-[#3b82f6]/30 transition-all cursor-pointer"
            onClick={() => navigate("/add-content?type=mashqlar")}
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
            onClick={() => navigate("/add-content?type=taomnnoma")}
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
      </div>
    </div>
  );
};

export default ContentTypeSelection;
