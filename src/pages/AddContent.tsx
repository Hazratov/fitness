import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, ArrowLeft, Check, Home, FileText } from "lucide-react";
import {
  useContent,
  ExerciseStep,
  MealPreparationStep,
} from "@/contexts/ContentContext";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// Import custom components
import ContentTypeDialog from "@/components/ContentTypeDialog";
import ExerciseForm, {
  exerciseSchema,
  ExerciseFormValues,
} from "@/components/ExerciseForm";
import MealForm, { mealSchema, MealFormValues } from "@/components/MealForm";
import ExerciseSteps from "@/components/ExerciseSteps";
import MealSteps from "@/components/MealSteps";

type ContentType = "mashqlar" | "taomnnoma";

const AddContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    addExerciseBlock,
    addMeal,
  } = useContent();

  // Parse content type from URL query parameter
  const getInitialContentType = (): ContentType => {
    const searchParams = new URLSearchParams(location.search);
    const typeParam = searchParams.get("type");
    return (typeParam === "taomnnoma") ? "taomnnoma" : "mashqlar";
  };

  // State
  const [contentType, setContentType] = useState<ContentType>(getInitialContentType());  
  const [steps, setSteps] = useState<(ExerciseStep | MealPreparationStep)[]>([]);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [foodPhoto, setFoodPhoto] = useState<string | null>(null);
  const [stepImages, setStepImages] = useState<Record<string, string>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const exerciseForm = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      duration: 40,
      description: "",
      video_url: "",
    },
    mode: "onChange",
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
    mode: "onChange",
  });

  // Effect to update URL when content type changes
  useEffect(() => {
    // Update the URL when content type changes without triggering a navigation
    const url = new URL(window.location.href);
    url.searchParams.set("type", contentType);
    window.history.replaceState({}, "", url.toString());
    
    console.log("Content Type changed:", contentType);
    
    // Reset forms and states when content type changes
    if (contentType === "mashqlar") {
      exerciseForm.reset();
    } else {
      mealForm.reset();
    }
    
    setSteps([]);
    setMainImage(null);
    setFoodPhoto(null);
    setStepImages({});
  }, [contentType]);

  const handleMainImageUpload = (file: File) => {
    if (!file.size) {
      if (contentType === "mashqlar") {
        setMainImage(null);
      } else {
        setFoodPhoto(null);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (contentType === "mashqlar") {
        setMainImage(reader.result as string);
      } else {
        setFoodPhoto(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
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
      setStepImages((prev) => ({ ...prev, [stepId]: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const addStep = () => {
    // Create steps locally in add mode
    const newStepId = crypto.randomUUID();

    if (contentType === "mashqlar") {
      const newStep: ExerciseStep = {
        id: newStepId,
        name: "",
        duration: "5 - 10 daqiqa",
        description: "",
      };
      setSteps((prev) => [...prev, newStep]);
    } else {
      const newStep: MealPreparationStep = {
        id: newStepId,
        description: "",
        title: "",
        step_time: "5",
        step_number: steps.length + 1,
      };
      setSteps((prev) => [...prev, newStep]);
    }
  };

  const updateStep = (
    id: string,
    data: Partial<ExerciseStep | MealPreparationStep>
  ) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, ...data } : step))
    );
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));

    // Also remove any associated images
    if (stepImages[id]) {
      const newStepImages = { ...stepImages };
      delete newStepImages[id];
      setStepImages(newStepImages);
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
          description: formData.description,
          video_url: formData.video_url,
          steps: steps as ExerciseStep[],
          image_url: mainImage || undefined,
        };
        console.log("Exercise Data:", exerciseData);

        // For new content, the steps will be created as part of the block
        await addExerciseBlock(exerciseData);
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
          food_photo_url: foodPhoto || undefined,
        };

        // For new content, the steps will be created as part of the meal
        await addMeal(mealData);
      }

      toast.success("Muvaffaqiyatli qo'shildi");
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
          <button className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d54cf] px-4 py-2 rounded-full">
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
          <h1 className="text-2xl font-bold">Kontent qo'shish</h1>
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
              mainImage={foodPhoto}
              onImageUpload={handleMainImageUpload}
            />
          )}
        </div>

        {/* Steps Section */}
        <div className="bg-[#1a2336] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {contentType === "mashqlar"
              ? "Mashqlar ketma ketligi kiritish"
              : "Tayyorlash ketma ketligi kiritish"}
          </h2>

          {contentType === "mashqlar" ? (
            <ExerciseSteps
              steps={steps as ExerciseStep[]}
              stepImages={stepImages}
              onAddStep={addStep}
              onUpdateStep={updateStep}
              onRemoveStep={removeStep}
              onStepImageUpload={handleStepImageUpload}
            />
          ) : (
            <MealSteps
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
              <span>Yaratish va chiqib ketish</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AddContent;