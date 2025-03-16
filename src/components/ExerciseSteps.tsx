import React, { useRef } from "react";
import { Upload, X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ExerciseStep } from "@/contexts/ContentContext";
import { toast } from "sonner";

interface ExerciseStepsProps {
  blockId?: string;
  steps: ExerciseStep[];
  stepImages: Record<string, string>;
  onAddStep: () => void;
  onUpdateStep: (id: string, data: Partial<ExerciseStep>) => void;
  onRemoveStep: (id: string) => void;
  onStepImageUpload: (stepId: string, file: File) => void;
}

const ExerciseSteps: React.FC<ExerciseStepsProps> = ({
  blockId,
  steps,
  stepImages,
  onAddStep,
  onUpdateStep,
  onRemoveStep,
  onStepImageUpload
}) => {
  const stepFileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
  // Only update local state
  const handleUpdateStep = (id: string, data: Partial<ExerciseStep>) => {
    onUpdateStep(id, data);
  };
  
  // Handle file selection without immediate API call
  const handleFileChange = (stepId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpdateStep(stepId, { file }); 
      onStepImageUpload(stepId, file);
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
                  <label className="block text-sm font-medium mb-2">Mashq nomi</label>
                  <Input 
                    type="text" 
                    placeholder="Isitish"
                    className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6]"
                    value={step.name || ""}
                    onChange={(e) => handleUpdateStep(step.id, { name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Davomiyligi</label>
                  <Input 
                    type="text" 
                    placeholder="5 - 10 daqiqa"
                    className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6]"
                    value={step.duration || ""}
                    onChange={(e) => handleUpdateStep(step.id, { duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tavsif</label>
                <Textarea 
                  placeholder="Yengil yurish yoki joggingni oqrgani uchun mashqlar"
                  className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6] h-16"
                  value={step.description || ""}
                  onChange={(e) => handleUpdateStep(step.id, { description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rasm yuklash</label>
                <div 
                  className={`
                    border-2 border-dashed rounded-lg p-4 h-40 flex flex-col items-center justify-center
                    ${stepImages[step.id] ? 'border-[#2c3855]' : 'border-[#3b82f6] border-opacity-50 hover:border-opacity-100'}
                    transition-all cursor-pointer bg-[#1a2336]
                  `}
                  onClick={() => stepFileInputRefs.current[step.id]?.click()}
                >
                  {stepImages[step.id] ? (
                    <div className="relative w-full h-full">
                      <img 
                        src={stepImages[step.id]} 
                        alt="Upload preview" 
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button 
                        className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newStepImages = { ...stepImages };
                          delete newStepImages[step.id];
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload size={32} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-400">Mashq rasmi yuklash</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={(ref) => {
                      stepFileInputRefs.current[step.id] = ref;
                    }}
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => handleFileChange(step.id, e)}
                  />
                </div>
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

export default ExerciseSteps;