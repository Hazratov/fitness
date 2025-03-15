
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, ArrowLeft, Check, Home, FileText } from "lucide-react";
import { useContent, ExerciseStep, MealPreparationStep } from "@/contexts/ContentContext";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// Import custom components
import ContentTypeDialog from "@/components/ContentTypeDialog";
import ExerciseForm, { exerciseSchema, ExerciseFormValues } from "@/components/ExerciseForm";
import MealForm, { mealSchema, MealFormValues } from "@/components/MealForm";
import ExerciseSteps from "@/components/ExerciseSteps";
import MealSteps from "@/components/MealSteps";

type ContentType = "mashqlar" | "taomnnoma";

const AddEditContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();

  const { 
    exerciseBlocks, 
    meals, 
    addExerciseBlock, 
    updateExerciseBlock, 
    uploadExerciseBlockImage,
    uploadExerciseStepImage,
    addMeal,
    updateMeal,
    uploadMealImage,
    createExerciseStep,
    createMealStep,
    updateExerciseStep,
    updateMealStep
  } = useContent();

  // State
  const [contentType, setContentType] = useState<ContentType>("mashqlar");
  const [steps, setSteps] = useState<(ExerciseStep | MealPreparationStep)[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [stepImages, setStepImages] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modifiedSteps, setModifiedSteps] = useState<Set<string>>(new Set());
  const [serverSteps, setServerSteps] = useState<Record<string, boolean>>({});

  // Forms
  const exerciseForm = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      duration: 40,
      description: "",
      video_url: "",
    },
    mode: "onChange"
  });

  const mealForm = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: "",
      calories: "0",
      water_intake: "0",
      preparation_time: 20,
      description: "",
      video_url: "",
      meal_type: "breakfast",
    },
    mode: "onChange"
  });

  // Open dialog for content type selection when adding new content
  useEffect(() => {
    if (!isEditMode) {
      setIsDialogOpen(true);
    }
  }, [isEditMode]);

  // Load existing data for editing
  useEffect(() => {
    if (isEditMode && id) {
      const exerciseBlock = exerciseBlocks.find(block => block.id === id);
      const meal = meals.find(meal => meal.id === id);

      if (exerciseBlock) {
        setContentType("mashqlar");
        exerciseForm.reset({
          name: exerciseBlock.name,
          duration: typeof exerciseBlock.duration === 'number' ? exerciseBlock.duration : parseInt(exerciseBlock.duration as string) || 0,
          description: exerciseBlock.description,
          video_url: exerciseBlock.video_url || "",
        });
        setSteps(exerciseBlock.steps);
        if (exerciseBlock.image_url) setMainImage(exerciseBlock.image_url);

        // Set step images
        const stepImgMap: Record<string, string> = {};
        const serverStepsMap: Record<string, boolean> = {};
        exerciseBlock.steps.forEach(step => {
          if (step.image_url) stepImgMap[step.id] = step.image_url;
          // Mark steps that exist on the server
          serverStepsMap[step.id] = true;
        });
        setStepImages(stepImgMap);
        setServerSteps(serverStepsMap);
      } else if (meal) {
        setContentType("taomnnoma");
        mealForm.reset({
          name: meal.name,
          calories: String(meal.calories || "0"),
          water_intake: String(meal.water_intake || "0"),
          preparation_time: typeof meal.preparation_time === 'number' ? meal.preparation_time : parseInt(String(meal.preparation_time)) || 0,
          description: meal.description,
          video_url: meal.video_url || "",
          meal_type: meal.meal_type,
        });
        setSteps(meal.steps);
        if (meal.image_url) setMainImage(meal.image_url);
        
        // Mark steps that exist on the server
        const serverStepsMap: Record<string, boolean> = {};
        meal.steps.forEach(step => {
          serverStepsMap[step.id] = true;
        });
        setServerSteps(serverStepsMap);
      }
    }
  }, [id, exerciseBlocks, meals, isEditMode, exerciseForm, mealForm]);

  const handleMainImageUpload = (file: File) => {
    if (!file.size) {
      setMainImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setMainImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (isEditMode && id) {
      if (contentType === "mashqlar") {
        uploadExerciseBlockImage(id, file);
      } else {
        uploadMealImage(id, file);
      }
    }
  };

  const handleStepImageUpload = (stepId: string, file: File) => {
    if (!file.size) {
      const newStepImages = { ...stepImages };
      delete newStepImages[stepId];
      setStepImages(newStepImages);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setStepImages(prev => ({ ...prev, [stepId]: reader.result as string }));
    };
    reader.readAsDataURL(file);

    // Mark the step as modified
    setModifiedSteps(prev => new Set(prev).add(stepId));

    // Images are still uploaded immediately since they require a different API
    if (isEditMode && id && contentType === "mashqlar") {
      uploadExerciseStepImage(id, stepId, file);
    }
  };

  const addStep = async () => {
    if (isEditMode && id) {
      if (contentType === "mashqlar") {
        const newStepData: Omit<ExerciseStep, "id"> = {
          name: "",
          duration: "5 - 10 daqiqa",
          description: "",
        };
        
        // Create the step on the server and get back the ID
        const newStepId = await createExerciseStep(id, newStepData);
        
        // Add to local state with the returned ID
        const newStep: ExerciseStep = {
          id: newStepId,
          ...newStepData
        };
        setSteps(prev => [...prev, newStep]);
        
        // Mark as existing on server
        setServerSteps(prev => ({...prev, [newStepId]: true}));
      } else {
        const newStepData: Omit<MealPreparationStep, "id"> = {
          description: "",
          title: "",
          step_time: "5",
          step_number: steps.length + 1,
        };
        
        // Create the step on the server and get back the ID
        const newStepId = await createMealStep(id, newStepData);
        
        // Add to local state with the returned ID
        const newStep: MealPreparationStep = {
          id: newStepId,
          ...newStepData
        };
        setSteps(prev => [...prev, newStep]);
        
        // Mark as existing on server
        setServerSteps(prev => ({...prev, [newStepId]: true}));
      }
    } else {
      // If we're in create mode, just create steps locally
      const newStepId = crypto.randomUUID();
      
      if (contentType === "mashqlar") {
        const newStep: ExerciseStep = {
          id: newStepId,
          name: "",
          duration: "5 - 10 daqiqa",
          description: "",
        };
        setSteps(prev => [...prev, newStep]);
      } else {
        const newStep: MealPreparationStep = {
          id: newStepId,
          description: "",
          title: "",
          step_time: "5",
          step_number: steps.length + 1,
        };
        setSteps(prev => [...prev, newStep]);
      }
    }
  };

  const updateStep = (id: string, data: Partial<ExerciseStep | MealPreparationStep>) => {
    // Only update local state, mark step as modified for later server update
    setSteps(prev =>
      prev.map(step => (step.id === id ? { ...step, ...data } : step))
    );
    
    // Add to modified steps set if it exists on server
    if (serverSteps[id]) {
      setModifiedSteps(prev => new Set(prev).add(id));
    }
  };

  const removeStep = (id: string) => {
    setSteps(prev => prev.filter(step => step.id !== id));
    
    // Also remove any associated images
    if (stepImages[id]) {
      const newStepImages = { ...stepImages };
      delete newStepImages[id];
      setStepImages(newStepImages);
    }
  };

  // Update all modified steps on the server
  const updateModifiedStepsOnServer = async () => {
    if (!isEditMode || !id) return;
    
    const promises = [];
    
    for (const stepId of modifiedSteps) {
      const step = steps.find(s => s.id === stepId);
      if (!step) continue;
      
      if (contentType === "mashqlar") {
        const exerciseStep = step as ExerciseStep;
        promises.push(
          updateExerciseStep(stepId, {
            name: exerciseStep.name,
            duration: exerciseStep.duration,
            description: exerciseStep.description
          })
        );
      } else {
        const mealStep = step as MealPreparationStep;
        promises.push(
          updateMealStep(stepId, {
            title: mealStep.title || "", // Ensure title is never empty as API requires it
            description: mealStep.description,
            step_time: mealStep.step_time,
            step_number: mealStep.step_number
          })
        );
      }
    }
    
    if (promises.length > 0) {
      try {
        await Promise.all(promises);
        // Clear modified steps after successful update
        setModifiedSteps(new Set());
      } catch (error) {
        console.error("Error updating steps:", error);
        toast.error("Ba'zi qadamlarni yangilashda xatolik yuz berdi");
      }
    }
  };

  const onSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      if (contentType === "mashqlar") {
        const isValid = await exerciseForm.trigger();
        if (!isValid) {
          setIsSubmitting(false);
          return;
        }

        const formData = exerciseForm.getValues();
        
        const exerciseData = {
          name: formData.name,
          duration: formData.duration,
          description: formData.description,
          video_url: formData.video_url,
          steps: steps as ExerciseStep[],
          image_url: mainImage || undefined,
        };

        if (isEditMode && id) {
          // First update the main exercise block
          await updateExerciseBlock(id, exerciseData);
          // Then update any modified steps
          await updateModifiedStepsOnServer();
        } else {
          // For new content, the steps will be created as part of the block
          await addExerciseBlock(exerciseData);
        }
      } else {
        const isValid = await mealForm.trigger();
        if (!isValid) {
          setIsSubmitting(false);
          return;
        }

        const formData = mealForm.getValues();
        
        const mealData = {
          name: formData.name,
          calories: formData.calories,
          water_intake: formData.water_intake,
          preparation_time: formData.preparation_time,
          description: formData.description,
          video_url: formData.video_url,
          meal_type: formData.meal_type,
          steps: steps as MealPreparationStep[],
          image_url: mainImage || undefined,
        };

        if (isEditMode && id) {
          // First update the main meal
          await updateMeal(id, mealData);
          // Then update any modified steps
          await updateModifiedStepsOnServer();
        } else {
          // For new content, the steps will be created as part of the meal
          await addMeal(mealData);
        }
      }

      toast.success(isEditMode ? "Muvaffaqiyatli yangilandi" : "Muvaffaqiyatli qo'shildi");
      navigate("/content");
    } catch (error) {
      toast.error("Xatolik yuz berdi");
      console.error("Error saving content:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] text-white">
      {/* Top Navigation Bar */}
      <div className="bg-[#1a2336] py-3 px-6 flex items-center justify-between sticky top-0 z-10">
        <div className="text-xl font-bold">Fitness Admin</div>
        <div className="flex items-center gap-4">
          <button 
            className="flex items-center gap-2 bg-[#252e3f] hover:bg-[#2c374d] px-4 py-2 rounded-full"
            onClick={() => navigate("/dashboard")}
          >
            <Home size={18} />
            <span>Asosiy</span>
          </button>
          <button 
            className="flex items-center gap-2 bg-[#252e3f] hover:bg-[#2c374d] px-4 py-2 rounded-full"
            onClick={() => navigate("/content")}
          >
            <FileText size={18} />
            <span>Kontentlar</span>
          </button>
          <button 
            className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d54cf] px-4 py-2 rounded-full"
          >
            <Plus size={18} />
            <span>Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Content Type Selection Dialog */}
      <ContentTypeDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        contentType={contentType} 
        onContentTypeChange={setContentType} 
      />

      <div className="container mx-auto p-6">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            className="p-2 rounded-full bg-[#1e293b] hover:bg-[#283548]"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Kontentni tahrirlash" : "Kontent qo'shish"}
          </h1>
        </div>

        {/* Main Form Section */}
        <div className="bg-[#1a2336] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {contentType === "mashqlar" ? "Mashq turi" : "Taom turi"}
          </h2>

          {contentType === "mashqlar" ? (
            <ExerciseForm 
              form={exerciseForm}
              mainImage={mainImage}
              onImageUpload={handleMainImageUpload}
            />
          ) : (
            <MealForm 
              form={mealForm}
              mainImage={mainImage}
              onImageUpload={handleMainImageUpload}
            />
          )}
        </div>

        {/* Steps Section */}
        <div className="bg-[#1a2336] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {contentType === "mashqlar" ? "Mashqlar ketma ketligi kiritish" : "Tayyorlash ketma ketligi kiritish"}
          </h2>

          {contentType === "mashqlar" ? (
            <ExerciseSteps 
              blockId={isEditMode ? id : undefined}
              steps={steps as ExerciseStep[]}
              stepImages={stepImages}
              onAddStep={addStep}
              onUpdateStep={updateStep}
              onRemoveStep={removeStep}
              onStepImageUpload={handleStepImageUpload}
            />
          ) : (
            <MealSteps 
              mealId={isEditMode ? id : undefined}
              steps={steps as MealPreparationStep[]}
              onAddStep={addStep}
              onUpdateStep={updateStep}
              onRemoveStep={removeStep}
            />
          )}
        </div>

        {/* Submit Button */}
        <Button 
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-6 bg-[#2563eb] hover:bg-[#1d54cf] text-white font-medium rounded-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Yuklanmoqda...</span>
          ) : (
            <>
              <Check size={20} />
              <span>{isEditMode ? "Saqlash va chiqib ketish" : "Yaratish va chiqib ketish"}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddEditContent;
