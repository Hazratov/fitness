
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Home, FileText, Plus } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import { Button } from "@/components/ui/button";
import AddContentDialog from "@/components/AddContentDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ContentType = "exercise" | "meal" | "all";

const ContentList: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ContentType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: string } | null>(null);
  
  const { exerciseBlocks, meals, deleteExerciseBlock, deleteMeal, fetchExerciseBlocks, fetchMeals } = useContent();
  
  useEffect(() => {
    fetchExerciseBlocks();
    fetchMeals();
  }, []);
  
  // Combine and filter content based on active tab
  const filteredContent = activeTab === "all" 
    ? [
        ...exerciseBlocks.map(block => ({ ...block, type: "Mashqlar" as const })),
        ...meals.map(meal => ({ ...meal, type: "Taomnnoma" as const }))
      ]
    : activeTab === "exercise"
    ? exerciseBlocks.map(block => ({ ...block, type: "Mashqlar" as const }))
    : meals.map(meal => ({ ...meal, type: "Taomnnoma" as const }));
    
  // Pagination
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const currentItems = filteredContent.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleEdit = (id: string, type: string) => {
    if (type === "Mashqlar") {
      navigate(`/edit-exercise/${id}`);
    } else {
      navigate(`/edit-meal/${id}`);
    }
  };
  
  const confirmDelete = (id: string, type: string) => {
    setItemToDelete({ id, type });
    setIsDeleteDialogOpen(true);
  };
  
  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    const { id, type } = itemToDelete;
    let success = false;
    
    if (type === "Mashqlar") {
      success = await deleteExerciseBlock(id);
    } else {
      success = await deleteMeal(id);
    }
    
    if (success) {
      // Refresh the data after successful deletion
      if (type === "Mashqlar") {
        fetchExerciseBlocks();
      } else {
        fetchMeals();
      }
    }
    
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };
  
  const handleAddContent = () => {
    setIsAddDialogOpen(true);
  };

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
            className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d54cf] text-white border-0"
          >
            <FileText size={18} />
            <span>Kontentlar</span>
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2 bg-[#252e3f] hover:bg-[#2c374d] text-white border-0"
            onClick={handleAddContent}
          >
            <Plus size={18} />
            <span>Qo'shish</span>
          </Button>
        </div>
      </div>
      
      {/* Add Content Dialog */}
      <AddContentDialog 
        isOpen={isAddDialogOpen} 
        onClose={() => setIsAddDialogOpen(false)} 
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1a2336] border-[#2c3855] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Kontentni o'chirish</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Siz rostdan ham bu kontentni o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#252e3f] hover:bg-[#2c374d] text-white border-0">
              Bekor qilish
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              O'chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-8">Kontentlar</h1>
        
        {/* Content Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-md transition-all ${
              activeTab === "all" ? "bg-[#3b82f6] text-white" : "bg-[#1e293b] text-gray-300 hover:bg-[#283548]"
            }`}
            onClick={() => setActiveTab("all")}
          >
            Barchasi
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-all ${
              activeTab === "exercise" ? "bg-[#3b82f6] text-white" : "bg-[#1e293b] text-gray-300 hover:bg-[#283548]"
            }`}
            onClick={() => setActiveTab("exercise")}
          >
            Mashqlar
          </button>
          <button
            className={`px-4 py-2 rounded-md transition-all ${
              activeTab === "meal" ? "bg-[#3b82f6] text-white" : "bg-[#1e293b] text-gray-300 hover:bg-[#283548]"
            }`}
            onClick={() => setActiveTab("meal")}
          >
            Taomnnoma
          </button>
        </div>
        
        {/* Content Table */}
        <div className="bg-[#1e293b] rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="bg-[#273549] text-gray-300">
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Sarlavha</th>
                <th className="py-3 px-4 text-left">Kontent</th>
                <th className="py-3 px-4 text-left">Tahrirlash</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="border-t border-[#374151] hover:bg-[#1a2234] transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-300">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="py-3 px-4">{item.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-medium ${
                        item.type === "Mashqlar" ? "bg-[#433b24] text-[#f59e0b]" : "bg-[#153226] text-[#10b981]"
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-3">
                        <button 
                          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#252e3f] hover:bg-[#2c374d] text-gray-300 text-sm"
                          onClick={() => handleEdit(item.id, item.type)}
                        >
                          <span>O'zgartirish kiritish</span>
                          <Edit size={16} />
                        </button>
                        <button 
                          className="p-2 rounded-md bg-[#252e3f] hover:bg-[#3a1c1c] hover:text-red-400 text-sm text-gray-300"
                          onClick={() => confirmDelete(item.id, item.type)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-[#374151]">
                  <td colSpan={4} className="py-6 text-center text-gray-400">
                    Kontentlar topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-center gap-2">
            <button 
              className="p-2 rounded-md bg-[#1e293b] hover:bg-[#283548] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`w-8 h-8 rounded-md ${
                  currentPage === page
                    ? "bg-[#3b82f6] text-white"
                    : "bg-[#1e293b] hover:bg-[#283548] text-gray-300"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              className="p-2 rounded-md bg-[#1e293b] hover:bg-[#283548] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentList;
