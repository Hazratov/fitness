import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import ExerciseForm, {
  exerciseSchema,
  ExerciseFormValues,
} from "@/components/ExerciseForm";
import MealForm, { mealSchema, MealFormValues } from "@/components/MealForm";
import {
  useContent,
  ExerciseStep,
  MealPreparationStep,
} from "@/contexts/ContentContext";
import { Button } from "@/components/ui/button";

const EditContent: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    exerciseBlocks,
    meals,
    updateExerciseBlock,
    updateMeal,
    uploadExerciseBlockImage,
    uploadMealImage,
    createExerciseStep,
    createMealStep,
    updateExerciseStep,
    updateMealStep,
  } = useContent();
  const [contentType, setContentType] = useState<"mashqlar" | "taomnnoma">(
    "mashqlar"
  );
  const [steps, setSteps] = useState<(ExerciseStep | MealPreparationStep)[]>(
    []
  );
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [foodPhoto, setFoodPhoto] = useState<string | null>(null);
  const [stepImages, setStepImages] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modifiedSteps, setModifiedSteps] = useState<Set<string>>(new Set());
  const [serverSteps, setServerSteps] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    if (id) {
      const exerciseBlock = exerciseBlocks.find((block) => block.id === id);
      const meal = meals.find((meal) => meal.id === id);

      if (exerciseBlock) {
        setContentType("mashqlar");
        exerciseForm.reset({
          name: exerciseBlock.name,
          duration:
            typeof exerciseBlock.duration === "number"
              ? exerciseBlock.duration
              : parseInt(exerciseBlock.duration as string) || 0,
          description: exerciseBlock.description,
          video_url: exerciseBlock.video_url || "",
        });
        setSteps(exerciseBlock.steps);
        if (exerciseBlock.image_url) setMainImage(exerciseBlock.image_url);

        const stepImgMap: Record<string, string> = {};
        const serverStepsMap: Record<string, boolean> = {};
        exerciseBlock.steps.forEach((step) => {
          if (step.image_url) stepImgMap[step.id] = step.image_url;
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
          preparation_time:
            typeof meal.preparation_time === "number"
              ? meal.preparation_time
              : parseInt(String(meal.preparation_time)) || 0,
          description: meal.description,
          video_url: meal.video_url || "",
          meal_type: meal.meal_type,
        });
        setSteps(meal.steps);
        if (meal.image_url) setFoodPhoto(meal.image_url);

        const serverStepsMap: Record<string, boolean> = {};
        meal.steps.forEach((step) => {
          serverStepsMap[step.id] = true;
        });
        setServerSteps(serverStepsMap);
      }
    }
  }, [id, exerciseBlocks, meals, exerciseForm, mealForm]);

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

    if (id) {
      if (contentType === "mashqlar") {
        uploadExerciseBlockImage(id, file);
      } else {
        uploadMealImage(id, file);
      }
    }
  };

  const addStep = async () => {
    if (id) {
      if (contentType === "mashqlar") {
        const newStepData: Omit<ExerciseStep, "id"> = {
          name: "",
          duration: "5 - 10 daqiqa",
          description: "",
        };

        const newStepId = await createExerciseStep(id, newStepData);

        const newStep: ExerciseStep = {
          id: newStepId,
          ...newStepData,
        };
        setSteps((prev) => [...prev, newStep]);
        setServerSteps((prev) => ({ ...prev, [newStepId]: true }));
      } else {
        const newStepData: Omit<MealPreparationStep, "id"> = {
          description: "",
          title: "",
          step_time: "5",
          step_number: steps.length + 1,
        };

        const newStepId = await createMealStep(id, newStepData);

        const newStep: MealPreparationStep = {
          id: newStepId,
          ...newStepData,
        };
        setSteps((prev) => [...prev, newStep]);
        setServerSteps((prev) => ({ ...prev, [newStepId]: true }));
      }
    } else {
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
    }
  };

  const updateStep = (
    id: string,
    data: Partial<ExerciseStep | MealPreparationStep>
  ) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === id ? { ...step, ...data } : step))
    );

    if (serverSteps[id]) {
      setModifiedSteps((prev) => new Set(prev).add(id));
    }
  };

  const removeStep = (id: string) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));

    if (stepImages[id]) {
      const newStepImages = { ...stepImages };
      delete newStepImages[id];
      setStepImages(newStepImages);
    }
  };

  const updateModifiedStepsOnServer = async () => {
    if (!id) return;

    const promises = [];

    for (const stepId of modifiedSteps) {
      const step = steps.find((s) => s.id === stepId);
      if (!step) continue;

      if (contentType === "mashqlar") {
        const exerciseStep = step as ExerciseStep;
        promises.push(
          updateExerciseStep(stepId, {
            name: exerciseStep.name,
            duration: exerciseStep.duration,
            description: exerciseStep.description,
          })
        );
      } else {
        const mealStep = step as MealPreparationStep;
        promises.push(
          updateMealStep(stepId, {
            title: mealStep.title || "",
            description: mealStep.description,
            step_time: mealStep.step_time,
            step_number: mealStep.step_number,
          })
        );
      }
    }

    if (promises.length > 0) {
      try {
        await Promise.all(promises);
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
          block_name: formData.name,
          description: formData.description,
          video_url: formData.video_url,
          steps: steps as ExerciseStep[],
          image_url: mainImage || undefined,
        };

        if (id) {
          await updateExerciseBlock(id, exerciseData);
          await updateModifiedStepsOnServer();
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
          food_photo_url: foodPhoto || undefined,
        };

        if (id) {
          await updateMeal(id, mealData);
          await updateModifiedStepsOnServer();
        }
      }

      toast.success("Kontent yangilandi");
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
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <button
            className="p-2 rounded-full bg-[#1e293b] hover:bg-[#283548]"
            onClick={() => navigate(-1)}
          >
            Orqaga
          </button>
          <h1 className="text-2xl font-bold">Kontentni tahrirlash</h1>
        </div>

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

        <div className="bg-[#1a2336] rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {contentType === "mashqlar"
              ? "Mashqlar ketma ketligi kiritish"
              : "Tayyorlash ketma ketligi kiritish"}
          </h2>

          {contentType === "mashqlar" ? (
            <ExerciseSteps
              blockId={id}
              steps={steps as ExerciseStep[]}
              stepImages={stepImages}
              onAddStep={addStep}
              onUpdateStep={updateStep}
              onRemoveStep={removeStep}
            />
          ) : (
            <MealSteps
              mealId={id}
              steps={steps as MealPreparationStep[]}
              onAddStep={addStep}
              onUpdateStep={updateStep}
              onRemoveStep={removeStep}
            />
          )}
        </div>

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full py-6 bg-[#2563eb] hover:bg-[#1d54cf] text-white font-medium rounded-lg flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <span>Yuklanmoqda...</span>
          ) : (
            <span>Saqlash va chiqib ketish</span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditContent;
