import React from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MealPreparationStep } from "@/contexts/ContentContext";

interface MealStepsProps {
  steps: MealPreparationStep[];
  onAddStep: () => void;
  onUpdateStep: (id: string, data: Partial<MealPreparationStep>) => void;
  onRemoveStep: (id: string) => void;
}

// Vaqt formatlovchi funksiya: "HH:MM:SS"
const formatTime = (inputValue: string) => {
  const digits = inputValue.replace(/\D/g, "").slice(0, 6);
  if (digits.length >= 4) {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`;
  } else if (digits.length >= 2) {
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }
  return digits;
};

const TimeInput = ({ value, onChange }: { value: string; onChange: (newTime: string) => void }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(formatTime(e.target.value));
  };

  return (
    <Input
      type="text"
      placeholder="00:00:00"
      className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6] text-white px-3 py-2 rounded"
      value={value}
      onChange={handleChange}
    />
  );
};

const MealSteps: React.FC<MealStepsProps> = ({ steps, onAddStep, onUpdateStep, onRemoveStep }) => {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <div key={step.id} className="p-4 bg-[#131c2e] rounded-lg border border-[#2c3855]">
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
                    onChange={(e) => onUpdateStep(step.id, { title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Qadam vaqti (soat:daq:soniya)</label>
                  <TimeInput value={step.step_time || ""} onChange={(newTime) => onUpdateStep(step.id, { step_time: newTime })} />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Tavsif</label>
                <Textarea
                  placeholder="Tuxumlarni suvda qaynatib yoki pishirib qiling"
                  className="bg-[#1a2336] border-[#2c3855] focus-visible:ring-[#3b82f6] h-16"
                  value={step.description || ""}
                  onChange={(e) => onUpdateStep(step.id, { description: e.target.value })}
                />
              </div>
            </div>

            <button className="p-2 rounded-full hover:bg-[#283548] text-red-400" onClick={() => onRemoveStep(step.id)}>
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
