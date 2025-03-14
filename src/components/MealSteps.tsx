
import React from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MealPreparationStep } from "@/contexts/ContentContext";
import { toast } from "sonner";
import { useContent } from "@/contexts/ContentContext";

interface MealStepsProps {
  mealId?: string;
  steps: MealPreparationStep[];
  onAddStep: () => void;
  onUpdateStep: (id: string, data: Partial<MealPreparationStep>) => void;
  onRemoveStep: (id: string) => void;
}

const MealSteps: React.FC<MealStepsProps> = ({
  mealId,
  steps,
  onAddStep,
  onUpdateStep,
  onRemoveStep
}) => {
  const { updateMealStep } = useContent();

  const handleUpdateStep = async (id: string, data: Partial<MealPreparationStep>) => {
    // Update local state immediately for responsive UI
    onUpdateStep(id, data);
    
    // If we're in edit mode and have a mealId, sync with backend
    if (mealId) {
      try {
        await updateMealStep(id, data);
      } catch (error) {
        console.error("Failed to update meal step on server:", error);
        toast.error("Taom tayyorlash qadami yangilanmadi, qayta urinib ko'ring");
      }
    }
  };

  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div 
          key={step.id} 
          className="p-4 bg-[#131c2e] rounded-lg border border-[#2c3855]"
        >
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center bg-[#1a2336] text-[#3b82f6] w-8 h-8 rounded-full font-semibold">
              {index + 1}
            </div>
            
            <div className="flex-1">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Qadam sarlavhasi</label>
                  <Input 
                    type="text" 
                    placeholder="Tayyorgarlik"
                    className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6]"
                    value={step.title || ""}
                    onChange={(e) => handleUpdateStep(step.id, { title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Qadam vaqti (daqiqa)</label>
                  <Input 
                    type="text" 
                    placeholder="5"
                    className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6]"
                    value={step.step_time || ""}
                    onChange={(e) => handleUpdateStep(step.id, { step_time: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tavsif</label>
                <Textarea 
                  placeholder="Tuxumlarni suvda qaynatring yoki pishiring qiling"
                  className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6] h-16"
                  value={step.description || ""}
                  onChange={(e) => handleUpdateStep(step.id, { description: e.target.value })}
                />
              </div>
            </div>

            <button 
              className="p-2 rounded-full hover:bg-[#283548] text-red-400"
              onClick={() => onRemoveStep(step.id)}
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ))}

      <button 
        className="w-full py-3 bg-[#131c2e] hover:bg-[#1e293b] rounded-lg border border-[#2c3855] flex items-center justify-center gap-2 text-sm font-medium"
        onClick={onAddStep}
      >
        <Plus size={16} />
        <span>Qadam qo'shish</span>
      </button>
    </div>
  );
};

export default MealSteps;
